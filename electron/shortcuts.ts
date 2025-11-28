import { globalShortcut, app } from 'electron';
import { getSettings } from './store';
import { readClipboard, writeClipboard } from './clipboard';
import { optimizePrompt } from './optimizer';
import { showNotification } from './notifications';
import { BrowserWindow } from 'electron';

let currentShortcut: string | null = null;

export const registerGlobalShortcut = (shortcut: string, mainWindow: BrowserWindow | null): boolean => {
  // Alten Shortcut entfernen
  if (currentShortcut) {
    globalShortcut.unregister(currentShortcut);
  }

  // Neuen Shortcut registrieren
  const registered = globalShortcut.register(shortcut, async () => {
    try {
      const clipboardText = readClipboard();
      
      if (!clipboardText || clipboardText.trim().length === 0) {
        showNotification('MRP', 'Zwischenablage ist leer', false);
        return;
      }

      const settings = getSettings();
      
      // Optimierung durchführen
      const result = await optimizePrompt({
        userPrompt: clipboardText,
        metaprompt: '', // Wird aus Store geladen
        provider: settings.activeProvider,
        model: settings.defaultModel[settings.activeProvider],
        maxTokens: settings.maxTokens,
        temperature: settings.temperature,
      });

      if (result.success && result.optimizedPrompt) {
        writeClipboard(result.optimizedPrompt);
        showNotification('MRP', 'Prompt erfolgreich optimiert', true);
        
        // Event an Renderer senden
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('optimization:complete', result.optimizedPrompt);
        }
      } else {
        showNotification('MRP', `Fehler: ${result.error || 'Unbekannter Fehler'}`, false);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unbekannter Fehler';
      showNotification('MRP', `Fehler: ${message}`, false);
    }
  });

  if (registered) {
    currentShortcut = shortcut;
  }

  return registered;
};

export const unregisterGlobalShortcut = (): void => {
  if (currentShortcut) {
    globalShortcut.unregister(currentShortcut);
    currentShortcut = null;
  }
};

export const unregisterAllShortcuts = (): void => {
  globalShortcut.unregisterAll();
};

