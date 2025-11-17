# 🏋️ Powerlifting Manager

Application desktop professionnelle pour gérer des compétitions de powerlifting de A à Z.

[![Tauri](https://img.shields.io/badge/Tauri-2.x-blue.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## 📖 Description

Powerlifting Manager est une solution complète pour organiser et gérer des compétitions de powerlifting conformes aux règles IPF (International Powerlifting Federation) et autres fédérations. L'application permet de gérer tout le cycle de vie d'une compétition, de la création jusqu'à la génération des classements finaux.

**🌍 Application Bilingue** : Interface complète disponible en **Français** et **Anglais** avec changement de langue à la volée.

## ✨ Fonctionnalités Principales

### ✅ Gestion de Compétitions
- Création et édition de compétitions
- Support multi-fédérations (IPF, USAPL, USPA, FFForce)
- **Formats de compétition**:
  - 🏋️ **Full Power (SBD)**: Squat + Bench + Deadlift
  - 💪 **Bench Only**: Compétitions de développé couché uniquement
- Statuts de compétition (upcoming, in_progress, completed)
- Tableau de bord avec statistiques en temps réel

### ✅ Gestion des Athlètes
- CRUD complet des athlètes
- Import CSV en masse
- Export CSV des listes d'athlètes
- Validation automatique des catégories de poids
- Gestion des hauteurs de racks (squat, bench)

### ✅ Pesée (Weigh-In)
- Formulaire de pesée interactif
- Validation du poids par rapport à la catégorie
- Enregistrement des tentatives d'ouverture (squat, bench, deadlift)
- Configuration des hauteurs de racks

### ✅ Gestion des Flights
- Calcul automatique des flights
- Répartition équilibrée des athlètes (max 14 par flight)
- Validation de l'équilibre des flights

### ✅ Compétition en Direct
- Interface de gestion en temps réel optimisée (sans scroll)
- Sélection du mouvement adaptée au format de compétition
- Ordre de passage automatique selon les règles IPF
- **Timer de compétition**:
  - Compte à rebours de 60 secondes
  - Reset automatique à chaque changement d'athlète
  - Contrôle manuel (pas de démarrage automatique)
  - Alertes sonores à 30s, 15s et 10s
- **Système d'arbitrage IPF conforme**:
  - 3 juges indépendants
  - Lumières **blanches** (Good Lift) et **rouges** (No Lift)
  - Affichage en temps réel des votes
  - Calcul automatique du résultat (2/3 pour valider)
- Enregistrement automatique des tentatives en base de données
- Contrôle manuel pour passer à l'athlète suivant
- Affichage du résultat avant de continuer

### ✅ Classements et Résultats
- Calcul automatique des scores:
  - **IPF GL Points** (formule 2020)
  - **Wilks** (formule classique)
  - **DOTS** (nouvelle formule)
- Classements par catégorie
- Classements absolus
- Filtres par genre et catégorie de poids
- Export des résultats

### ✅ Affichage Externe (Broadcast)
- **Écran externe temps réel** pour le public et les athlètes
- Affichage de l'athlète en cours (nom, poids, tentative)
- Timer synchronisé avec indication des alertes
- Résultats en direct avec lumières IPF (blanc/rouge)
- **Modes de communication**:
  - **BroadcastChannel** en mode navigateur (développement)
  - **WebSocket** en mode Tauri (production)
- Ouverture dans une nouvelle fenêtre depuis l'interface de gestion
- Design professionnel adapté aux projecteurs

### ✅ Affichage Spotters
- **Écran dédié pour l'équipe technique** (spotters et loaders)
- **Calculateur de chargement de barre IPF**:
  - Prise en compte des colliers obligatoires (2.5kg chacun, 5kg total)
  - Calcul automatique de la combinaison optimale de disques
  - Plaques standards IPF avec codes couleur
  - Schéma visuel symétrique de la barre chargée
- **Affichage des hauteurs de racks**:
  - Hauteur de rack squat
  - Hauteur de rack bench press
  - Hauteur de sécurité bench press
- **Informations athlète**:
  - Nom, mouvement, tentative, lot number
  - Poids à charger en gros caractères
- Liste détaillée des disques par côté
- Interface optimisée sans scroll
- Synchronisation temps réel via BroadcastChannel/WebSocket

### ✅ Déclarations de Poids
- **Système de gestion des déclarations** pour les tentatives suivantes
- **Calcul automatique des poids suggérés** selon les règles IPF :
  - +2,5kg minimum après une tentative réussie
  - Même poids après un échec
- **Interface de déclaration** :
  - Tableau récapitulatif de tous les athlètes
  - Affichage du résultat de la dernière tentative (Bon/Mauvais Mouvement)
  - Poids suggéré et champ de saisie pour le poids déclaré
  - Statut de déclaration (En Attente/Déclaré)
- Accessible depuis les Actions Rapides de la compétition en direct
- Support du clic molette pour ouverture dans un nouvel onglet
- Interface bilingue FR/EN complète

### 🎭 Mode Démo
- Générateur de données de démonstration
- 3 compétitions avec athlètes et tentatives
- Formats variés (Full Power et Bench Only)
- Idéal pour tester l'application

## 🚀 Stack Technique

### Frontend
- **Framework Desktop**: Tauri 2.x
- **UI Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Ant Design 5.x
- **Routing**: React Router v6
- **State Management**: Zustand
- **Internationalization**: react-i18next (FR/EN)
- **Date Handling**: Day.js
- **Validation**: Zod

### Backend
- **Language**: Rust
- **Database**: SQLite (via tauri-plugin-sql)
- **Real-time**: WebSocket server (tokio-tungstenite)
- **Architecture**: Feature-based structure

### Calculs et Algorithmes
- IPF GL Points calculation
- Wilks & DOTS formulas
- Attempt ordering (weight-based, lot-based)
- Flight distribution algorithm
- Age category calculation
- **Bar loading calculator** (greedy algorithm pour combinaison optimale de disques)

## 🛠️ Installation

### Prérequis
- **Node.js** 18+ et npm
- **Rust** 1.70+
- **Tauri CLI**

#### Installation des prérequis Linux
```bash
# Installer Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Installer les dépendances système
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### Installation du projet

```bash
# Cloner le repository
git clone https://github.com/mateo-brl/powerlifting-manager.git
cd powerlifting-manager

# Installer les dépendances
npm install

# Lancer en mode développement
npm run tauri dev

# Build de production
npm run tauri build
```

## 📁 Structure du Projet

```
liftmanager/
├── src/
│   ├── components/           # Composants globaux
│   │   ├── Dashboard.tsx
│   │   ├── Layout.tsx
│   │   └── DemoDataInitializer.tsx
│   ├── features/            # Features par domaine
│   │   ├── competition/     # Gestion des compétitions
│   │   │   ├── components/
│   │   │   ├── stores/
│   │   │   └── types/
│   │   ├── athlete/         # Gestion des athlètes
│   │   ├── weigh-in/        # Module de pesée
│   │   └── competition-flow/ # Compétition en direct
│   │       ├── components/
│   │       │   ├── LiveCompetition.tsx
│   │       │   ├── AttemptTracker.tsx
│   │       │   ├── Timer.tsx
│   │       │   ├── ExternalDisplay.tsx
│   │       │   ├── SpottersDisplay.tsx
│   │       │   ├── FlightManagement.tsx
│   │       │   └── Rankings.tsx
│   │       ├── stores/
│   │       │   └── broadcastStore.ts
│   │       └── utils/
│   │           └── barLoading.ts
│   └── shared/              # Utilitaires partagés
│       ├── constants/
│       ├── utils/
│       └── hooks/
├── src-tauri/               # Backend Rust
│   ├── src/
│   │   ├── commands/        # Commands Tauri
│   │   └── database/        # Migrations SQLite
│   └── Cargo.toml
└── README.md
```

## 📊 Schéma de Base de Données

### Table: competitions
```sql
- id (TEXT PRIMARY KEY)
- name (TEXT NOT NULL)
- date (TEXT NOT NULL)
- location (TEXT)
- federation (TEXT NOT NULL)
- format (TEXT NOT NULL) -- 'full_power' | 'bench_only'
- status (TEXT DEFAULT 'upcoming')
- created_at, updated_at (TIMESTAMP)
```

### Table: athletes
```sql
- id (TEXT PRIMARY KEY)
- competition_id (TEXT FK)
- first_name, last_name (TEXT NOT NULL)
- date_of_birth (TEXT NOT NULL)
- gender (TEXT NOT NULL) -- 'M' | 'F'
- weight_class (TEXT NOT NULL)
- division (TEXT NOT NULL) -- 'raw' | 'equipped'
- age_category (TEXT NOT NULL)
- lot_number (INTEGER)
- bodyweight (REAL)
- squat_rack_height, bench_rack_height (INTEGER)
```

### Table: weigh_ins
```sql
- id (TEXT PRIMARY KEY)
- athlete_id, competition_id (TEXT FK)
- bodyweight (REAL NOT NULL)
- opening_squat, opening_bench, opening_deadlift (REAL)
- squat_rack_height, bench_rack_height, bench_safety_height (INTEGER)
```

### Table: attempts
```sql
- id (TEXT PRIMARY KEY)
- athlete_id, competition_id (TEXT FK)
- lift_type (TEXT) -- 'squat' | 'bench' | 'deadlift'
- attempt_number (INTEGER) -- 1, 2, 3
- weight_kg (REAL NOT NULL)
- result (TEXT) -- 'success' | 'failure'
- referee_votes (TEXT) -- JSON: [true, false, true]
- rack_height (INTEGER)
```

## 📐 Catégories de Poids IPF

**Hommes**: 59kg, 66kg, 74kg, 83kg, 93kg, 105kg, 120kg, +120kg
**Femmes**: 47kg, 52kg, 57kg, 63kg, 69kg, 76kg, 84kg, +84kg

**Catégories d'âge**: Sub-Junior, Junior, Open, Master 1, Master 2, Master 3, Master 4

## 🧮 Formules de Calcul

### IPF GL Points (2020)
Formule officielle IPF pour normaliser les performances selon le poids corporel et le genre.

### Wilks
Formule classique de comparaison inter-catégories.

### DOTS
Nouvelle formule moderne plus précise que Wilks.

## 🎯 Utilisation

### 1. Créer une Compétition
- Aller sur "Dashboard" → "New Competition"
- Remplir le nom, date, lieu, fédération
- **Choisir le format**:
  - Full Power (SBD) pour compétition complète
  - Bench Only pour compétition de développé couché uniquement
- Sauvegarder

### 2. Ajouter des Athlètes
- Ouvrir la compétition → Onglet "Athletes"
- "Add Athlete" ou "Import Athletes" (CSV)
- Remplir les informations

#### 📄 Format CSV pour l'Import d'Athlètes

Pour importer plusieurs athlètes en une seule fois, créez un fichier CSV avec les colonnes suivantes :

**Colonnes requises :**
- `first_name` : Prénom de l'athlète
- `last_name` : Nom de famille
- `date_of_birth` : Date de naissance (format: YYYY-MM-DD)
- `gender` : M ou F
- `weight_class` : Catégorie de poids (ex: 74, 83, 93, 105, 120, 120+, etc.)

**Colonnes optionnelles :**
- `division` : raw ou equipped (par défaut: raw)
- `age_category` : sub_junior, junior, open, master1, master2, master3, master4 (par défaut: open)
- `team` : Nom de l'équipe ou club
- `lot_number` : Numéro de lot (1-4)

**Exemple de fichier CSV :**
```csv
first_name,last_name,date_of_birth,gender,weight_class,division,age_category,team,lot_number
Jean,Martin,1995-03-15,M,83,raw,open,Club Paris,1
Sophie,Bernard,1998-07-22,F,63,raw,open,Club Lyon,2
Pierre,Dubois,1992-11-08,M,93,equipped,open,Club Marseille,1
Marie,Leroy,2001-04-30,F,57,raw,junior,Club Bordeaux,2
```

**Instructions :**
1. Créez le fichier CSV avec les colonnes ci-dessus
2. Dans la compétition, allez sur "Athletes" → "Import Athletes"
3. Cliquez sur "Upload" et sélectionnez votre fichier CSV
4. Vérifiez l'aperçu des données
5. Cliquez sur "Import Athletes" pour finaliser l'import

### 3. Pesée
- Ouvrir la compétition → "Competition Actions" → "Weigh-In"
- Sélectionner un athlète
- Entrer le poids et les tentatives d'ouverture
- Configurer les hauteurs de racks (squat, bench) et sécurité (bench)

### 4. Calculer les Flights
- "Competition Actions" → "Flight Management"
- Cliquer sur "Calculate Flights"

### 5. Lancer la Compétition
- "Competition Actions" → "Live Competition"
- Sélectionner le mouvement (selon le format)
  - Full Power: Squat → Bench → Deadlift
  - Bench Only: Bench uniquement
- Cliquer "Start" pour démarrer la session
- **Ouvrir les affichages externes**:
  - **"Open External Display"** → Écran public (athlète, timer, résultats)
  - **"Open Spotters Display"** → Écran technique (chargement de barre, racks)
- Pour chaque athlète:
  1. **Les spotters préparent la barre** selon l'affichage technique
  2. **Démarrer le timer** manuellement (bouton Start)
  3. Les **3 juges votent** avec les lumières blanches/rouges
  4. **Confirmer la tentative** une fois les 3 votes enregistrés
  5. Le résultat s'affiche (Good Lift blanc ou No Lift rouge)
  6. Cliquer sur **"Next Athlete"** pour passer au suivant
  7. Le timer se réinitialise automatiquement à 60s
- **Gérer les déclarations de poids** :
  - Cliquer sur **"Déclarations de Poids"** dans les Actions Rapides
  - Visualiser tous les athlètes devant déclarer leur prochain poids
  - Le système suggère automatiquement le poids minimum (IPF)
  - Entrer les poids déclarés et enregistrer

### 6. Voir les Résultats
- "Competition Actions" → "Rankings & Results"
- Filtrer par genre et catégorie
- Consulter les classements

## 🚧 Statut du Projet

- ✅ **Phase 1**: Setup + CRUD complet
- ✅ **Phase 2**: Logique métier (Pesée, Flights)
- ✅ **Phase 3**: Compétition en temps réel + Broadcast
- ✅ **Phase 4**: Calculs de scores et classements
- ✅ **Phase 5**: Améliorations UX/UI
  - Interface compacte sans scroll
  - Conformité IPF (lumières blanches/rouges)
  - Formats de compétition (Full Power, Bench Only)
  - Contrôle manuel du flux de compétition
  - Timer avec reset automatique
  - Affichage externe WebSocket
- 🔄 **Évolutions futures**:
  - Export PDF des résultats
  - Statistiques avancées
  - Support multi-plateformes (Windows, macOS, Linux)

## 🎨 Conformité IPF

Cette application respecte les standards officiels de l'IPF :
- ⚪ **Lumières blanches** pour les "Good Lift"
- 🔴 **Lumières rouges** pour les "No Lift"
- ⏱️ Timer de 60 secondes entre chaque tentative
- 📊 Formule IPF GL Points 2020 officielle
- 🏋️ Support des formats Full Power et Bench Only
- 📋 Ordre de passage conforme aux règlements
- ⚖️ **Chargement de barre IPF**:
  - Prise en compte des colliers obligatoires (2.5kg × 2 = 5kg)
  - Plaques standards IPF avec codes couleur officiels
  - Barre standard 20kg (hommes et femmes)

## 🤝 Contribution

Projet développé avec ❤️ par [@mateobrl](https://github.com/mateobrl)

Développé avec l'assistance de **Claude Code** (Anthropic)

## 📝 Licence

Propriétaire - Tous droits réservés

## 📞 Support

Pour toute question ou suggestion: mateobaril.pro@gmail.com

## 🙏 Remerciements

- [Tauri](https://tauri.app/) pour le framework desktop
- [Ant Design](https://ant.design/) pour les composants UI
- [IPF](https://www.powerlifting.sport/) pour les règles et formules
- La communauté powerlifting pour les retours et suggestions

---

**Made with ❤️ and 🏋️ for the powerlifting community**
