# Guide d'Installation - Powerlifting Manager

## Installation Rapide (Utilisateurs)

### Téléchargement Direct

La méthode la plus simple est de télécharger l'installateur pré-compilé :

| Plateforme | Fichier | Instructions |
|------------|---------|--------------|
| **Windows** | `.exe` | Double-cliquez et suivez l'assistant |
| **macOS** | `.dmg` | Montez l'image et glissez dans Applications |
| **Linux** | `.deb` | `sudo dpkg -i powerlifting-manager_*.deb` |
| **Linux** | `.AppImage` | `chmod +x *.AppImage && ./*.AppImage` |

**Télécharger** : [Dernière version](https://github.com/mateo-brl/powerlifting-manager/releases/latest)

### Mises à jour automatiques

L'application vérifie automatiquement les nouvelles versions au démarrage. Quand une mise à jour est disponible, une notification apparaît avec :
- Le numéro de la nouvelle version
- Les notes de version (changelog)
- Un bouton pour télécharger et installer

---

## Installation Développeur

Pour contribuer ou modifier le code source :

### Prérequis

- **Node.js** 18+ et npm
- **Rust** 1.70+
- **Git**

### 1. Cloner le repository

```bash
git clone https://github.com/mateo-brl/powerlifting-manager.git
cd powerlifting-manager
```

### 2. Installation par plateforme

#### Linux (Ubuntu/Debian)

```bash
# Script automatique
chmod +x scripts/setup-linux.sh
./scripts/setup-linux.sh

# Ou manuellement
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Installer les dépendances
npm install
```

#### Windows

```powershell
# Script automatique (PowerShell en Admin)
.\scripts\setup-windows.ps1

# Ou manuellement
# 1. Installer Visual Studio Build Tools avec workload C++
# 2. Installer Rust: winget install Rustlang.Rust.MSVC
# 3. Installer Node.js: winget install OpenJS.NodeJS

npm install
```

> ⚠️ **Important** : N'utilisez PAS Git Bash pour lancer l'application. Utilisez PowerShell ou CMD.

#### macOS

```bash
# Installer les outils Xcode
xcode-select --install

# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Installer les dépendances
npm install
```

### 3. Lancer en développement

```bash
npm run tauri dev
```

### 4. Build de production

```bash
# Build pour la plateforme actuelle
npm run tauri build

# Les fichiers sont générés dans src-tauri/target/release/bundle/
```

---

## CI/CD

Le projet utilise GitHub Actions pour :

### Intégration Continue (`ci.yml`)

Déclenché sur chaque push/PR :
- Tests unitaires (Vitest)
- Vérification TypeScript
- Build frontend
- Vérification Rust (cargo check, clippy)

### Release (`release.yml`)

Déclenché sur les tags `v*` :
- Build multi-plateforme (Windows, macOS, Linux)
- Génération du changelog avec git-cliff
- Génération des checksums SHA256
- Publication sur GitHub Releases

### Créer une release

```bash
# 1. Mettre à jour la version dans tauri.conf.json et package.json
# 2. Committer les changements
git add .
git commit -m "chore: bump version to v0.2.0"

# 3. Créer et pousser le tag
git tag v0.2.0
git push origin main --tags
```

Le workflow de release se déclenche automatiquement.

---

## Structure du Projet

```
powerlifting-manager/
├── .github/workflows/     # CI/CD GitHub Actions
│   ├── ci.yml            # Tests et vérifications
│   └── release.yml       # Builds multi-plateforme
├── src/                   # Frontend React/TypeScript
│   ├── components/       # Composants globaux
│   ├── features/         # Modules par fonctionnalité
│   ├── hooks/            # Hooks personnalisés
│   ├── i18n/             # Traductions FR/EN
│   ├── shared/           # Utilitaires partagés
│   └── theme/            # Configuration thème
├── src-tauri/            # Backend Rust
│   ├── src/
│   │   ├── commands/     # Commandes Tauri
│   │   ├── database/     # Schéma et migrations SQLite
│   │   └── websocket/    # Serveur WebSocket
│   ├── Cargo.toml        # Dépendances Rust
│   └── tauri.conf.json   # Configuration Tauri
├── cliff.toml            # Configuration changelog
├── package.json          # Dépendances npm
└── vite.config.ts        # Configuration Vite
```

---

## Ressources

- [Documentation Tauri](https://tauri.app)
- [Documentation Ant Design](https://ant.design)
- [IPF Technical Rules](https://www.powerlifting.sport/rules/codes/info/technical-rules)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

---

## Support

- **Issues** : [GitHub Issues](https://github.com/mateo-brl/powerlifting-manager/issues)
- **Email** : mateobaril.pro@gmail.com
