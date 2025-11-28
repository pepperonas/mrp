# MRP (Meta Prompt Refiner) – Vollständige Entwicklungsspezifikation

## Projektübersicht

Entwickle eine Desktop-Anwendung namens **"MRP" (Meta Prompt Refiner)** – ein Hintergrund-Tool zur KI-gestützten Prompt-Optimierung mit Clipboard-Integration.

---

## Technologie-Stack

| Komponente | Technologie |
|------------|-------------|
| Framework | Electron 28+ |
| Frontend | React 18+ mit TypeScript 5+ |
| Styling | Tailwind CSS 3.4+ |
| State Management | Zustand |
| Build Tool | Vite |
| Packaging | electron-builder |
| Storage | electron-store (verschlüsselt für API-Keys) |

---

## Zielplattformen & Deployment

### Anforderungen

- **Windows**: Portable .exe (kein Installer, kein Admin erforderlich)
- **macOS**: .app Bundle (Intel + Apple Silicon Universal Binary)
- **Linux**: AppImage (portable, keine Installation)

### Kritische Constraints

- ❌ Keine externen Runtime-Dependencies (kein WebView2-Download, keine .NET Runtime)
- ❌ Keine Administrator-/Root-Rechte erforderlich
- ✅ Alle Konfigurationsdaten im User-Verzeichnis speichern
- ✅ Sofort startbar nach Download (Plug & Play)

---

## Funktionale Anforderungen

### 1. API-Key-Management

```
Unterstützte Anbieter:
├── OpenAI (ChatGPT) – GPT-4o, GPT-4-Turbo
├── Anthropic (Claude) – Claude 3.5 Sonnet, Claude 3 Opus
├── xAI (Grok) – Grok-2
└── Google (Gemini) – Gemini 1.5 Pro, Gemini 1.5 Flash
```

**Funktionen:**
- Sichere Speicherung aller API-Keys (verschlüsselt mit electron-safeStorage)
- Validierung der API-Keys beim Speichern (Test-Request)
- Visueller Status pro Anbieter (✓ aktiv / ✗ ungültig / ○ nicht konfiguriert)
- Ein Anbieter als "Aktiv" auswählbar (Radio-Selection)

### 2. Metaprompt-Verwaltung

**Datenstruktur pro Metaprompt:**
```typescript
interface Metaprompt {
  id: string;                    // UUID
  name: string;                  // Anzeigename
  description?: string;          // Optionale Beschreibung
  content: string;               // Der eigentliche Metaprompt
  isDefault: boolean;            // Als Standard markiert
  createdAt: Date;
  updatedAt: Date;
}
```

**Funktionen:**
- CRUD-Operationen für Metaprompts
- Import/Export als JSON
- Ein Metaprompt als "Standard" markierbar
- KI-gestützte Optimierung eines Metaprompts (mit aktivem Anbieter)
- Versionierung/History (letzte 5 Versionen pro Metaprompt)

### 3. System Tray Integration

**Tray-Menü Struktur:**
```
MRP
├── Prompt optimieren (Shortcut anzeigen)
├── ─────────────────
├── Aktiver Anbieter ►
│   ├── ● OpenAI
│   ├── ○ Claude
│   ├── ○ Grok
│   └── ○ Gemini
├── Aktiver Metaprompt ►
│   ├── ● Standard Optimizer
│   ├── ○ Code Review
│   └── ○ Creative Writing
├── ─────────────────
├── Einstellungen
├── ─────────────────
└── Beenden
```

**Verhalten:**
- App startet minimiert im System Tray
- Linksklick auf Tray-Icon → Hauptfenster öffnen
- Rechtsklick → Kontextmenü
- Fenster schließen → Minimiert in Tray (nicht beenden)

### 4. Global Shortcut & Workflow

**Standard-Shortcut:** `Ctrl+Shift+M` (konfigurierbar)

**Workflow bei Shortcut-Aktivierung:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User kopiert Text in Zwischenablage                      │
│ 2. User drückt Global Shortcut                              │
│ 3. App liest Clipboard-Inhalt                               │
│ 4. App sendet Prompt + Metaprompt an aktive API             │
│ 5. Während Verarbeitung: Loading-Indikator im Tray          │
│ 6. Nach Antwort:                                            │
│    - System-Notification mit Erfolg/Fehler                  │
│    - Optimierter Prompt → Zwischenablage                    │
│    - Optional: Kleines Popup mit Preview                    │
│ 7. User kann optimierten Prompt direkt einfügen (Ctrl+V)    │
└─────────────────────────────────────────────────────────────┘
```

### 5. Einstellungen

```typescript
interface Settings {
  // Allgemein
  launchAtStartup: boolean;           // Autostart mit System
  minimizeToTray: boolean;            // Bei Schließen minimieren
  showNotifications: boolean;         // System-Benachrichtigungen
  
  // Shortcut
  globalShortcut: string;             // z.B. "CommandOrControl+Shift+M"
  
  // API-Verhalten
  activeProvider: Provider;           // Aktuell ausgewählter Anbieter
  defaultModel: Record<Provider, string>; // Bevorzugtes Modell pro Anbieter
  maxTokens: number;                  // Max Response Tokens (default: 2048)
  temperature: number;                // 0.0 - 1.0 (default: 0.7)
  
  // Metaprompts
  activeMetapromptId: string;         // ID des aktiven Metaprompts
}
```

---

## User Interface Spezifikation

### Design System

```css
/* Farben */
--bg-primary: #1A1C27;
--bg-secondary: #2C2E3B;
--brand: #4A90E2;
--accent: #FF6B35;
--text-primary: #FFFFFF;
--text-secondary: #B0B3C1;

/* Typography */
--font-family: 'Inter', system-ui, sans-serif;

/* Komponenten */
--radius-lg: 0.5rem;
--radius-xl: 0.75rem;
--transition: 300ms ease;

/* Effekte */
--glow-brand: 0 0 20px rgba(74, 144, 226, 0.3);
--glow-accent: 0 0 20px rgba(255, 107, 53, 0.3);
```

### Fenster-Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ○ ○ ○                        MRP                       ─ □ x │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ OpenAI  │ │ Claude  │ │  Grok   │ │ Gemini  │   [Tabs]   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │              [ Hauptbereich - Tab Content ]            │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Status: ● Bereit  |  Shortcut: Ctrl+Shift+M  |  v1.0.0  ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### Screens

1. **Dashboard** – Übersicht aller Provider, Quick-Actions
2. **API-Keys** – Eingabe und Validierung der Keys
3. **Metaprompts** – Liste, Editor, Import/Export
4. **Einstellungen** – Allgemeine Konfiguration
5. **History** – Letzte Optimierungen mit Vorher/Nachher

---

## API-Integration

### Request-Format (vereinheitlicht)

```typescript
interface OptimizationRequest {
  userPrompt: string;        // Aus Clipboard
  metaprompt: string;        // Aktiver Metaprompt
  provider: Provider;
  model: string;
  maxTokens: number;
  temperature: number;
}
```

### Standard-Metaprompt (vorinstalliert)

```markdown
Du bist ein Experte für Prompt Engineering. Deine Aufgabe ist es, den folgenden Prompt zu optimieren.

## Optimierungsrichtlinien:
1. Formuliere klar und präzise
2. Füge relevanten Kontext hinzu
3. Definiere das gewünschte Ausgabeformat
4. Entferne Mehrdeutigkeiten
5. Strukturiere komplexe Anfragen in Schritte

## Eingabe-Prompt:
{user_prompt}

## Aufgabe:
Gib NUR den optimierten Prompt zurück, ohne Erklärungen oder Kommentare.
```

### Error Handling

```typescript
type ApiError = 
  | { type: 'RATE_LIMIT'; retryAfter: number }
  | { type: 'INVALID_KEY'; provider: Provider }
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'CONTENT_FILTER'; message: string }
  | { type: 'TIMEOUT' }
  | { type: 'UNKNOWN'; message: string };
```

---

## Projektstruktur

```
mrp/
├── electron/
│   ├── main.ts                 # Electron Main Process
│   ├── preload.ts              # Preload Script (Context Bridge)
│   ├── tray.ts                 # System Tray Logic
│   ├── shortcuts.ts            # Global Shortcut Registration
│   ├── clipboard.ts            # Clipboard Operations
│   ├── store.ts                # electron-store Configuration
│   └── notifications.ts        # Native Notifications
│
├── src/
│   ├── main.tsx                # React Entry Point
│   ├── App.tsx                 # Root Component
│   │
│   ├── components/
│   │   ├── ui/                 # Reusable UI Components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── StatusBar.tsx
│   │   └── features/
│   │       ├── ApiKeyForm.tsx
│   │       ├── MetapromptEditor.tsx
│   │       ├── ProviderSelector.tsx
│   │       └── HistoryList.tsx
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── ApiKeys.tsx
│   │   ├── Metaprompts.tsx
│   │   ├── Settings.tsx
│   │   └── History.tsx
│   │
│   ├── stores/
│   │   ├── useSettingsStore.ts
│   │   ├── useApiKeysStore.ts
│   │   └── useMetapromptsStore.ts
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── openai.ts
│   │   │   ├── anthropic.ts
│   │   │   ├── grok.ts
│   │   │   └── gemini.ts
│   │   └── optimizer.ts        # Unified Optimization Logic
│   │
│   ├── hooks/
│   │   ├── useClipboard.ts
│   │   └── useNotification.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── styles/
│       └── globals.css         # Tailwind + Custom Styles
│
├── resources/
│   ├── icon.png                # App Icon (1024x1024)
│   ├── icon.ico                # Windows Icon
│   └── icon.icns               # macOS Icon
│
├── package.json
├── electron-builder.yml        # Build Configuration
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## Build-Konfiguration

### electron-builder.yml

```yaml
appId: io.celox.mrp
productName: MRP
copyright: "© 2025 Martin Pfeffer | celox.io"

directories:
  output: dist
  buildResources: resources

files:
  - "dist-electron/**/*"
  - "dist/**/*"

# Windows - Portable
win:
  target:
    - target: portable
      arch: [x64]
  icon: resources/icon.ico

portable:
  artifactName: "MRP-${version}-Windows-Portable.exe"

# macOS - Universal Binary
mac:
  target:
    - target: dir
      arch: [universal]
  icon: resources/icon.icns
  category: public.app-category.productivity

# Linux - AppImage
linux:
  target:
    - target: AppImage
      arch: [x64]
  icon: resources/icon.png
  category: Utility

# Keine Auto-Updates für Portable (optional später hinzufügen)
publish: null
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && electron-builder",
    "build:win": "npm run build -- --win",
    "build:mac": "npm run build -- --mac",
    "build:linux": "npm run build -- --linux",
    "build:all": "npm run build -- --win --mac --linux"
  }
}
```

---

## Sicherheitsanforderungen

1. **API-Key-Verschlüsselung**: Nutzung von `safeStorage` API von Electron
2. **Context Isolation**: Aktiviert (kein direkter Node.js-Zugriff im Renderer)
3. **Content Security Policy**: Strikte CSP für Renderer-Prozess
4. **Keine Remote-Module**: Deaktiviert
5. **Input-Sanitization**: Alle User-Inputs validieren

```typescript
// Preload Script - Sichere IPC-Bridge
contextBridge.exposeInMainWorld('mrp', {
  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: Settings) => ipcRenderer.invoke('settings:set', settings),
  
  // API Keys (verschlüsselt)
  getApiKey: (provider: Provider) => ipcRenderer.invoke('apiKey:get', provider),
  setApiKey: (provider: Provider, key: string) => ipcRenderer.invoke('apiKey:set', provider, key),
  validateApiKey: (provider: Provider, key: string) => ipcRenderer.invoke('apiKey:validate', provider, key),
  
  // Metaprompts
  getMetaprompts: () => ipcRenderer.invoke('metaprompts:get'),
  saveMetaprompt: (mp: Metaprompt) => ipcRenderer.invoke('metaprompts:save', mp),
  deleteMetaprompt: (id: string) => ipcRenderer.invoke('metaprompts:delete', id),
  
  // Optimization
  optimize: (request: OptimizationRequest) => ipcRenderer.invoke('optimize', request),
  
  // Events
  onShortcutTriggered: (callback: () => void) => ipcRenderer.on('shortcut:triggered', callback),
  onOptimizationComplete: (callback: (result: string) => void) => ipcRenderer.on('optimization:complete', callback),
});
```

---

## Akzeptanzkriterien

### Must Have (MVP)
- [ ] Portable Builds für Windows, macOS, Linux ohne externe Dependencies
- [ ] API-Key-Verwaltung für alle 4 Anbieter
- [ ] Mindestens 1 vorinstallierter Metaprompt
- [ ] Global Shortcut funktioniert zuverlässig
- [ ] Clipboard-Workflow komplett funktional
- [ ] System-Notifications bei Abschluss
- [ ] System Tray mit Basis-Menü

### Should Have
- [ ] Metaprompt-Editor mit Syntax-Highlighting
- [ ] History der letzten 20 Optimierungen
- [ ] Import/Export von Metaprompts
- [ ] Konfigurierbarer Shortcut
- [ ] Autostart-Option

### Nice to Have
- [ ] KI-gestützte Metaprompt-Optimierung
- [ ] Token-Counter vor dem Senden
- [ ] Kosten-Schätzung pro Request
- [ ] Mehrsprachige UI (DE/EN)

---

## Anhang

### Referenz-APIs

| Anbieter | Endpoint | Dokumentation |
|----------|----------|---------------|
| OpenAI | `https://api.openai.com/v1/chat/completions` | https://platform.openai.com/docs |
| Anthropic | `https://api.anthropic.com/v1/messages` | https://docs.anthropic.com |
| xAI (Grok) | `https://api.x.ai/v1/chat/completions` | https://docs.x.ai |
| Google | `https://generativelanguage.googleapis.com/v1beta/` | https://ai.google.dev/docs |

### Empfohlene Modelle (Stand 2025)

```typescript
const DEFAULT_MODELS = {
  openai: 'gpt-4o',
  anthropic: 'claude-3-5-sonnet-20241022',
  grok: 'grok-2-latest',
  gemini: 'gemini-1.5-pro-latest'
};
```

---

*Erstellt für Martin Pfeffer | celox.io*
*Prompt-Version: 1.0*