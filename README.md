# MRP - Meta Prompt Refiner

Ein Desktop-Tool zur KI-gestützten Prompt-Optimierung mit Clipboard-Integration.

## Features

- ✅ Unterstützung für 4 AI-Anbieter: OpenAI, Anthropic (Claude), xAI (Grok), Google (Gemini)
- ✅ Sichere API-Key-Verwaltung (verschlüsselt)
- ✅ Metaprompt-Verwaltung mit CRUD-Operationen
- ✅ Global Shortcut für schnelle Optimierung (Standard: Ctrl+Shift+M)
- ✅ System Tray Integration
- ✅ Clipboard-Workflow: Text kopieren → Shortcut drücken → Optimiertes Ergebnis in Zwischenablage
- ✅ History der letzten 20 Optimierungen
- ✅ Portable Builds für Windows, macOS und Linux

## Entwicklung

### Voraussetzungen

- Node.js 18+
- npm oder yarn

### Installation

```bash
npm install
```

### Entwicklung starten

```bash
npm run electron:dev
```

Dies startet:
- Vite Dev Server auf http://localhost:5173
- Electron App

### Build

```bash
# Alle Plattformen
npm run build:all

# Spezifische Plattform
npm run build:win
npm run build:mac
npm run build:linux
```

Die Builds werden im `dist/` Verzeichnis erstellt.

## Verwendung

1. **API-Keys konfigurieren**: Gehe zu "API-Keys" und trage deine Keys ein
2. **Metaprompt auswählen**: Wähle oder erstelle einen Metaprompt in "Metaprompts"
3. **Anbieter wählen**: Wähle den aktiven AI-Anbieter im Dashboard
4. **Optimieren**: 
   - Kopiere einen Text in die Zwischenablage
   - Drücke `Ctrl+Shift+M` (oder konfigurierten Shortcut)
   - Der optimierte Prompt wird automatisch in die Zwischenablage kopiert

## Projektstruktur

```
mrp/
├── electron/          # Electron Main Process
├── src/              # React Frontend
│   ├── components/   # UI Komponenten
│   ├── pages/        # Seiten
│   ├── stores/       # Zustand Stores
│   ├── services/     # API Services
│   └── types/        # TypeScript Typen
├── resources/        # Icons & Assets
└── dist/             # Build Output
```

## Technologie-Stack

- **Electron 28+** - Desktop Framework
- **React 18+** - UI Framework
- **TypeScript 5+** - Type Safety
- **Tailwind CSS 3.4+** - Styling
- **Zustand** - State Management
- **Vite** - Build Tool
- **electron-builder** - Packaging

## Lizenz

MIT

## Autor

Martin Pfeffer | celox.io

