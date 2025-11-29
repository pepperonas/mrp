import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { createTray, updateTrayMenu, destroyTray } from './tray';
import { registerGlobalShortcut, unregisterAllShortcuts } from './shortcuts';
import { getSettings, setSettings, getApiKey, setApiKey, getMetaprompts, saveMetaprompt, deleteMetaprompt, getHistory, addHistory } from './store';
import { readClipboard, writeClipboard } from './clipboard';
import { optimizePrompt } from './optimizer';
import { validateApiKeyDirect } from './validateApiKey';
import { DEFAULT_METAPROMPT } from '../src/types';
import { v4 as uuidv4 } from 'uuid';
import type { Settings, Metaprompt, Provider } from '../src/types';

// Get __dirname for ES modules
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#1A1C27',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Entwicklung: Vite Dev Server
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Statische Dateien
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Fenster schließen → Minimieren in Tray
  mainWindow.on('close', (event) => {
    const settings = getSettings();
    if (!isQuitting && settings.minimizeToTray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Tray erstellen
  createTray(mainWindow);

  // Global Shortcut registrieren
  const settings = getSettings();
  registerGlobalShortcut(settings.globalShortcut, mainWindow);
};

app.whenReady().then(() => {
  createWindow();

  // Standard-Metaprompt erstellen falls noch keiner existiert
  const metaprompts = getMetaprompts();
  if (metaprompts.length === 0) {
    const defaultMetaprompt: Metaprompt = {
      id: uuidv4(),
      name: 'Standard Optimizer',
      description: 'Standard-Metaprompt für Prompt-Optimierung',
      content: DEFAULT_METAPROMPT,
      isDefault: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    saveMetaprompt(defaultMetaprompt);
    
    // Als aktiv setzen
    const settings = getSettings();
    setSettings({ activeMetapromptId: defaultMetaprompt.id });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  unregisterAllShortcuts();
  destroyTray();
});

// IPC Handlers

// Settings
ipcMain.handle('settings:get', () => getSettings());
ipcMain.handle('settings:set', (_event, settings: Partial<Settings>) => {
  setSettings(settings);
  updateTrayMenu(mainWindow);
  
  // Shortcut neu registrieren falls geändert
  if (settings.globalShortcut) {
    registerGlobalShortcut(settings.globalShortcut, mainWindow);
  }
});

// API Keys
ipcMain.handle('apiKey:get', (_event, provider: Provider) => getApiKey(provider));
ipcMain.handle('apiKey:set', (_event, provider: Provider, key: string) => {
  setApiKey(provider, key);
});

ipcMain.handle('apiKey:validate', async (_event, provider: Provider, key: string) => {
  // Temporär setzen für Validierung
  const oldKey = getApiKey(provider);
  setApiKey(provider, key);
  
  try {
    // Direkte Validierung ohne Optimizer-Umweg
    const validation = await validateApiKeyDirect(provider, key);
    
    if (!validation.valid) {
      // Alten Key wiederherstellen falls Validierung fehlschlägt
      if (oldKey) {
        setApiKey(provider, oldKey);
      }
      console.error(`API Key validation failed for ${provider}:`, validation.error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('API Key validation error:', error);
    // Alten Key wiederherstellen
    if (oldKey) {
      setApiKey(provider, oldKey);
    }
    return false;
  }
});

// Metaprompts
ipcMain.handle('metaprompts:get', () => getMetaprompts());
ipcMain.handle('metaprompts:save', (_event, mp: Metaprompt) => {
  saveMetaprompt(mp);
  updateTrayMenu(mainWindow);
});
ipcMain.handle('metaprompts:delete', (_event, id: string) => {
  deleteMetaprompt(id);
  updateTrayMenu(mainWindow);
});

// Optimization
ipcMain.handle('optimize', async (_event, request: any) => {
  const result = await optimizePrompt(request);
  
  // In History speichern
  if (result.success && result.optimizedPrompt) {
    addHistory({
      id: uuidv4(),
      originalPrompt: request.userPrompt,
      optimizedPrompt: result.optimizedPrompt,
      provider: request.provider,
      model: request.model,
      metapromptId: getSettings().activeMetapromptId,
      timestamp: new Date(),
      success: true,
    });
  } else {
    addHistory({
      id: uuidv4(),
      originalPrompt: request.userPrompt,
      optimizedPrompt: '',
      provider: request.provider,
      model: request.model,
      metapromptId: getSettings().activeMetapromptId,
      timestamp: new Date(),
      success: false,
      error: result.error,
    });
  }
  
  return result;
});

// Clipboard
ipcMain.handle('clipboard:read', () => readClipboard());
ipcMain.handle('clipboard:write', (_event, text: string) => writeClipboard(text));

// History
ipcMain.handle('history:get', () => getHistory());
ipcMain.handle('history:add', (_event, entry: any) => addHistory(entry));

