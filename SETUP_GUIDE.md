# Guide de Configuration - Powerlifting Manager

## ✅ Ce qui a été fait

### Structure du projet
- ✅ Configuration Tauri 2.x avec React 18 + TypeScript
- ✅ Configuration Vite pour le développement
- ✅ Structure de dossiers feature-based
- ✅ Configuration Git avec commits initiaux

### Frontend
- ✅ Types TypeScript complets (Competition, Athlete, Attempt)
- ✅ Stores Zustand pour Competition et Athlete
- ✅ Hooks personnalisés pour Tauri commands
- ✅ Utilitaires de calcul (IPF GL Points)
- ✅ Utilitaires de validation (Zod schemas)
- ✅ Utilitaires de formatage
- ✅ Constantes (fédérations, catégories, etc.)
- ✅ Configuration Ant Design avec locale FR

### Backend Rust
- ✅ Commands CRUD pour Competition
- ✅ Commands CRUD pour Athlete
- ✅ Schéma SQLite avec migrations
- ✅ Configuration tauri-plugin-sql

## 🔧 Prochaines étapes requises

### 1. Installation de Rust (OBLIGATOIRE)

Le projet nécessite Rust pour compiler la partie Tauri.

**Linux/macOS** :
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Windows** :
Téléchargez et installez depuis https://rustup.rs/

Vérifiez l'installation :
```bash
cargo --version
rustc --version
```

### 2. Installation des dépendances système Tauri

**Ubuntu/Debian** :
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**Fedora** :
```bash
sudo dnf install webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel
```

**Windows** :
- Installer Microsoft Visual Studio C++ Build Tools
- WebView2 est inclus dans Windows 11 et récent Windows 10

**macOS** :
```bash
xcode-select --install
```

### 3. Compiler le projet Rust

```bash
cd src-tauri
cargo build
cd ..
```

### 4. Créer le repository GitHub

1. Aller sur https://github.com/new
2. Nom du repository : `powerlifting-manager`
3. Description : "Application professionnelle de gestion de compétitions de powerlifting"
4. Visibilité : **Public**
5. NE PAS initialiser avec README (déjà fait)
6. Créer le repository

Puis pousser le code :
```bash
git remote add origin https://github.com/mateobrl/powerlifting-manager.git
git push -u origin main
```

### 5. Lancer le projet en développement

```bash
npm run tauri:dev
```

Cette commande va :
- Démarrer le serveur Vite (frontend React)
- Compiler et lancer l'application Tauri
- Ouvrir une fenêtre desktop

## 📋 Phase 2 - Développement des fonctionnalités

### À implémenter ensuite

1. **UI Gestion des Compétitions**
   - Créer `src/features/competition/components/CompetitionList.tsx`
   - Créer `src/features/competition/components/CompetitionForm.tsx`
   - Intégrer avec les Tauri commands

2. **UI Gestion des Athlètes**
   - Créer `src/features/athlete/components/AthleteList.tsx`
   - Créer `src/features/athlete/components/AthleteForm.tsx`
   - Implémenter l'import CSV

3. **Connexion SQLite**
   - Implémenter les requêtes dans les commands Rust
   - Utiliser tauri-plugin-sql pour les opérations DB
   - Exécuter les migrations au démarrage

4. **Module de Pesée**
   - Interface pour enregistrer les poids corporels
   - Validation des catégories de poids
   - Déclaration des tentatives d'ouverture

## 🐛 Problèmes connus

- ⚠️ Rust n'est pas encore installé sur le système
- ⚠️ Le repository GitHub n'est pas encore créé
- ℹ️ Les commandes Tauri ne sont pas encore connectées à SQLite (TODO marqués)

## 📚 Ressources

- [Documentation Tauri](https://tauri.app)
- [Documentation Ant Design](https://ant.design)
- [IPF Technical Rules](https://www.powerlifting.sport/rules/codes/info/technical-rules)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

## 🎯 Objectif

Application fonctionnelle pour gérer une vraie compétition dans **4 semaines** !
