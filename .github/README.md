# GitHub Configuration

Dieses Verzeichnis enthält GitHub-spezifische Konfigurationsdateien für das Metaprompt-Projekt.

## Verzeichnisstruktur

- **ISSUE_TEMPLATE/** - Issue Templates für Bug Reports und Feature Requests
- **PULL_REQUEST_TEMPLATE.md** - Template für Pull Requests
- **workflows/** - GitHub Actions Workflows für CI/CD

## Workflows

### release.yml - Build und Release

Automatisierter Build- und Release-Prozess für alle Plattformen.

**Trigger:**
- Push auf `main` Branch (Builds für alle Plattformen)
- Version Tags (`v*.*.*`, z.B. `v1.3.0`) - Erstellt GitHub Release
- Pull Requests zu `main` (Build-Tests)
- Manuell via `workflow_dispatch`

**Builds:**
- **macOS**: DMG Installer (Apple Silicon arm64)
- **Windows**: NSIS One-Click Installer (.exe)
- **Linux**: DEB, RPM und AppImage Pakete

**Features:**
- Automatische Artifact-Uploads (30 Tage Retention)
- GitHub Release mit Installationsanleitungen bei Version-Tags
- Multi-Platform Build Matrix (macOS, Windows, Linux parallel)

