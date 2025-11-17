# 🏋️ Powerlifting Manager

Application desktop professionnelle pour gérer des compétitions de powerlifting de A à Z.

[![Tauri](https://img.shields.io/badge/Tauri-2.x-blue.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## 📖 Description

Powerlifting Manager est une solution complète pour organiser et gérer des compétitions de powerlifting conformes aux règles IPF (International Powerlifting Federation) et autres fédérations. L'application permet de gérer tout le cycle de vie d'une compétition, de la création jusqu'à la génération des classements finaux.

## ✨ Fonctionnalités Principales

### ✅ Gestion de Compétitions
- Création et édition de compétitions
- Support multi-fédérations (IPF, USAPL, USPA, FFForce)
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
- Interface de gestion en temps réel
- Sélection du mouvement (squat, bench, deadlift)
- Ordre de passage automatique selon les règles IPF
- Timer de compétition (1 minute / 60 secondes)
- Système d'arbitrage à 3 lumières
- Enregistrement automatique des tentatives
- Navigation entre les tentatives

### ✅ Classements et Résultats
- Calcul automatique des scores:
  - **IPF GL Points** (formule 2020)
  - **Wilks** (formule classique)
  - **DOTS** (nouvelle formule)
- Classements par catégorie
- Classements absolus
- Filtres par genre et catégorie de poids
- Export des résultats

### 🎭 Mode Démo
- Générateur de données de démonstration
- 3 compétitions avec athlètes et tentatives
- Idéal pour tester l'application

## 🚀 Stack Technique

### Frontend
- **Framework Desktop**: Tauri 2.x
- **UI Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: Ant Design 5.x
- **Routing**: React Router v6
- **State Management**: Zustand
- **Date Handling**: Day.js
- **Validation**: Zod

### Backend
- **Language**: Rust
- **Database**: SQLite (via tauri-plugin-sql)
- **Architecture**: Feature-based structure

### Calculs et Algorithmes
- IPF GL Points calculation
- Wilks & DOTS formulas
- Attempt ordering (weight-based, lot-based)
- Flight distribution algorithm
- Age category calculation

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
│   │       │   ├── FlightManagement.tsx
│   │       │   └── Rankings.tsx
│   │       ├── stores/
│   │       └── utils/
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
- squat_rack_height, bench_rack_height (INTEGER)
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
- Sauvegarder

### 2. Ajouter des Athlètes
- Ouvrir la compétition → Onglet "Athletes"
- "Add Athlete" ou "Import Athletes" (CSV)
- Remplir les informations

### 3. Pesée
- Ouvrir la compétition → "Competition Actions" → "Weigh-In"
- Sélectionner un athlète
- Entrer le poids et les tentatives d'ouverture

### 4. Calculer les Flights
- "Competition Actions" → "Flight Management"
- Cliquer sur "Calculate Flights"

### 5. Lancer la Compétition
- "Competition Actions" → "Live Competition"
- Sélectionner le mouvement (Squat/Bench/Deadlift)
- Cliquer "Start"
- Utiliser le système d'arbitrage à 3 lumières
- Confirmer chaque tentative

### 6. Voir les Résultats
- "Competition Actions" → "Rankings & Results"
- Filtrer par genre et catégorie
- Consulter les classements

## 🚧 Statut du Projet

- ✅ **Phase 1**: Setup + CRUD complet (Complétée)
- ✅ **Phase 2**: Logique métier (Pesée, Flights) (Complétée)
- ✅ **Phase 3**: Compétition en temps réel (Complétée)
- ✅ **Phase 4**: Calculs de scores et classements (Complétée)
- 🔄 **Améliorations continues**: UI/UX, navigation, mode démo

## 🤝 Contribution

Projet développé par [@mateobrl](https://github.com/mateobrl)

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
