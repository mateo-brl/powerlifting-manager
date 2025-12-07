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

### ✅ Salle de Chauffe (Warmup Room Display)
- **Écran dédié pour la salle de chauffe** avec vue complète des passages
- **Affichage des 3 tentatives** pour chaque athlète :
  - Poids de chaque tentative (1, 2, 3)
  - Indicateurs visuels de statut :
    - ✅ **Vert** : Tentative réussie (Good Lift)
    - ❌ **Rouge** : Tentative échouée (No Lift)
    - ⏳ **Bleu** : Tentative en cours
    - **-** : Pas encore déclarée
- **Tri intelligent automatique** :
  - 🟢 **En haut** : Athlète qui passe actuellement (ligne verte)
  - ⚪ **Au milieu** : Athlètes à venir (triés par poids de tentative)
  - ⚫ **En bas** : Athlètes ayant terminé leurs 3 tentatives (grisés)
- **Auto-scroll** : Suit automatiquement l'athlète en cours
- **Synchronisation temps réel** via BroadcastChannel/WebSocket
- Affichage du nom, lot number et des 3 poids
- Interface optimisée pour affichage permanent sans interaction

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

### ✅ Exports & Documents Officiels
- **Export PDF des résultats** :
  - Résultats complets avec classements par catégorie
  - Feuilles imprimables individuelles format A4
  - Mise en page professionnelle
- **Export CSV OpenPowerlifting** :
  - Format standard pour archivage mondial
  - Validation automatique des données
  - Toutes colonnes requises (SBD, équipement, points, etc.)
- **Export FFForce (France)** :
  - Feuille de match informatique officielle
  - Feuille de pesée officielle
  - Export CSV détaillé avec hauteurs de racks
  - Conforme aux exigences FFForce
- **Certificats & Diplômes** :
  - Certificats de podium (Top 3) avec bordures or/argent/bronze
  - Certificats de participation personnalisés
  - Génération automatique en PDF
  - Support bilingue FR/EN

### ✅ Système de Gestion des Records
- **Base de données de records** :
  - Records mondiaux, nationaux, régionaux, personnels
  - Historique complet des records battus
  - Filtrage par fédération, catégorie, division
- **Détection automatique** :
  - Analyse en temps réel pendant les tentatives
  - Détection des nouveaux records
  - Détection des records approchés (< 2.5kg)
  - Vérification multi-niveaux (personnel/régional/national/mondial)
- **Notifications visuelles** :
  - Alertes animées pour nouveaux records (vert avec animation pulse)
  - Alertes pour records approchés (orange)
  - Badges sur les tentatives
  - Messages contextuels avec détails
  - Affichage de l'amélioration et de la distance au record

### ✅ Coefficient McCulloch pour Masters
- **Ajustement d'âge automatique** :
  - Formule polynomiale officielle McCulloch
  - Coefficients de 1.01 à 2.60+ pour athlètes 40+ ans
  - Coefficients distincts hommes/femmes
  - Application automatique pour catégories Masters
- **Calculs et affichages** :
  - Total brut vs total ajusté
  - Coefficient exact affiché
  - Classements Masters avec ajustement
  - Tableau de référence des coefficients par âge (40-90 ans)
- **Intégration complète** :
  - Compatible avec tous les exports (PDF, CSV)
  - Prise en compte dans les classements
  - Support bilingue FR/EN

### ✅ Gestion Multi-Plateformes
- **Support de plusieurs plateformes simultanées** :
  - Création et gestion de plateformes multiples
  - Association athlètes/tentatives par plateforme
  - Activation/désactivation des plateformes
  - Statistiques en temps réel par plateforme
- **Système de synchronisation intelligent** :
  - Auto-synchronisation configurable
  - Intervalle de sync personnalisable
  - Résolution de conflits automatique (latest/manual/source_priority)
  - Log de synchronisation avec historique
- **Fusion intelligente des résultats** :
  - Détection automatique des conflits
  - Fusion des tentatives multi-plateformes
  - Stratégies de résolution configurables
  - Classements fusionnés automatiquement
- **Interface de gestion** :
  - Tableau de bord des plateformes
  - Statut de progression par plateforme
  - Indicateurs visuels d'activité
  - Synchronisation manuelle ou automatique

### ✅ Statistiques & Analytics Avancées
- **Historique de progression des athlètes** :
  - Suivi complet de la progression au fil des compétitions
  - Graphiques de performance (ligne, barres, multi-lignes)
  - Évolution des totaux, IPF Points, Wilks, DOTS
  - Détection automatique des tendances (progression/régression)
- **Comparaisons historiques** :
  - Comparaison entre plusieurs compétitions
  - Analyse des tendances de participation
  - Statistiques de performance globales
  - Distribution des résultats (min, max, moyenne, médiane, quartiles)
- **Dashboard statistiques** :
  - Vue d'ensemble avec KPIs (taux de réussite, records personnels)
  - Graphiques interactifs de progression
  - Tableau d'historique des compétitions
  - Comparaison entre athlètes
- **Statistiques détaillées** :
  - Années d'activité, total de compétitions
  - Moyennes de progression annuelle
  - Meilleur mouvement (absolu et relatif)
  - Distribution par catégorie d'âge, division, poids

### ✅ Affichages Publics Améliorés
- **Écran de classements en direct** :
  - Optimisé pour affichage mural (projecteur, TV)
  - Design professionnel avec dégradés
  - Mise à jour automatique en temps réel
  - Affichage des podiums avec couleurs or/argent/bronze
  - Photos des athlètes et drapeaux de pays
  - Support des logos d'équipes
- **Overlays pour streaming OBS** :
  - **Lower Third** : Bandeau inférieur avec infos athlète (1920x250px)
  - **Scoreboard** : Tableau de score compact top 10 (400x600px)
  - **Attempt Overlay** : Infos tentative en cours avec timer (800x300px)
  - **Result Overlay** : Affichage résultat avec votes juges (600x400px)
  - Fonds transparents pour intégration OBS
  - Compatible green screen/chroma key
  - Animations fluides et professionnelles
- **Support média complet** :
  - Drapeaux de pays (emojis Unicode)
  - Photos des athlètes
  - Logos des équipes
  - Intégration dans tous les affichages existants

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
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **CSV Export**: PapaParse
- **Charts**: Recharts (graphiques de performance)

### Backend
- **Language**: Rust
- **Database**: SQLite (rusqlite + r2d2 connection pooling)
- **Real-time**: WebSocket server (tokio-tungstenite)
- **Architecture**: Feature-based structure
- **Persistance**: Système de migrations versionné avec auto-application au démarrage

### Architecture Base de Données
L'application utilise **SQLite** pour la persistance complète des données avec un système de migrations versionné.

**Tables principales** :
- `competitions` - Compétitions avec configuration (federation, format, statut)
- `athletes` - Athlètes avec informations complètes (catégorie, équipe, photos)
- `weigh_ins` - Données de pesée (poids corporel, tentatives d'ouverture, racks)
- `attempts` - Tentatives de levée avec votes des arbitres (JSON)
- `flights` - Organisation des flights avec liste d'athlètes (JSON)
- `protests` - **[NEW]** Système de protestations conforme IPF/FFForce (délai 60s)
- `_migrations` - Tracking des versions de schema

**Nouvelles fonctionnalités (Phase 0)** :
- ✅ Migration complète du stockage en mémoire vers SQLite persistant
- ✅ Connection pooling avec r2d2 pour performances optimales
- ✅ Système de migrations automatique avec versioning
- ✅ Table `protests` pour gestion des protestations IPF (60s deadline)
- ✅ Colonnes d'équipement dans `weigh_ins` pour validation IPF
- ✅ Toutes les données sont maintenant persistées dans `powerlifting.db`

**Backend Rust - Commandes Tauri (Phase 1)** :
- ✅ **Protestations** : `protest.rs` avec 4 commandes
  - `create_protest` : Création avec validation délai 60s et raison min 20 chars
  - `get_pending_protests` : Liste des protestations en attente
  - `resolve_protest` : Résolution par le jury (accepté/rejeté)
  - `get_protest_history` : Historique complet pour rapports
- ✅ **Validation Équipement** : `equipment.rs` avec 4 commandes
  - `update_athlete_equipment` : Enregistrement équipement complet (singlet, belt, sleeves, wraps, shoes)
  - `validate_equipment` : Validation officielle avec nom validateur + timestamp
  - `get_non_validated_equipment` : Liste équipements non validés
  - `get_all_equipment` : Vue complète pour exports

### ✅ Système de Protestations IPF
- **Gestion conforme aux règles IPF/FFForce** :
  - Délai de protestation de 60 secondes après tentative
  - Types de protestation : décision arbitrale, équipement, procédure
  - Raison minimum 20 caractères
- **Interface Jury Panel** :
  - Tableau des protestations en attente avec auto-refresh
  - Historique complet des protestations
  - Résolution avec notes du jury
  - Statuts : en attente, acceptée, rejetée
- **Bouton de protestation** :
  - Visible après validation de tentative
  - Timer countdown 60s avec badge coloré
  - Désactivation automatique après expiration

### ✅ Validation Équipement IPF
- **Base de données marques approuvées IPF** :
  - Singlets : SBD, Titan, Inzer, Metal, A7, Strengthshop, Eleiko, Wahlanders, Cerberus, Virus
  - Ceintures : SBD, Inzer, Pioneer, Eleiko, Wahlanders, Titan, Strengthshop, Metal, Best Belts, Cerberus
  - Genouillères : SBD, Titan, Rehband, Strengthshop, Eleiko, Metal, A7, Cerberus, Inzer
  - Bandes de poignets : SBD, Titan, Inzer, Strengthshop, Metal, Gangsta Wraps, A7, Cerberus, Pioneer
  - Chaussures : Adidas, Nike, Reebok, ASICS, Sabo, VS Athletics, Notorious Lift, Do-Win, Metal, Titan, Converse
- **Interface de validation** :
  - Autocomplete avec marques approuvées IPF
  - Indicateurs visuels de conformité (vert = approuvé, orange = non approuvé)
  - Équipements requis : singlet, chaussures
  - Équipements optionnels : ceinture, genouillères, bandes de poignets
  - Validation officielle avec nom du validateur et timestamp
- **Liste de validation** :
  - Tableau filtrable (tous/validés/non validés)
  - Statistiques en temps réel
  - Export CSV des équipements

### ✅ Exports Protestations & Équipements
- **Export PDF des protestations** :
  - Rapport complet avec résumé statistique
  - Tableau détaillé (heure, type, raison, statut, notes jury)
- **Export PDF des équipements** :
  - Rapport de validation avec statut conformité IPF
  - Détails par athlète (toutes les catégories d'équipement)
  - Nom du validateur et date de validation
- **Exports CSV** :
  - Export protestations avec tous les champs
  - Export équipements avec détails et statut validation
- **Rapport complet de compétition** :
  - Combine résultats, protestations et équipements
  - PDF professionnel avec sections distinctes

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

### 🏗️ Build Multi-Plateforme

L'application supporte nativement **Linux** et **Windows** grâce à Tauri.

#### Build pour Linux

Sur une machine Linux :
```bash
# Build pour Linux (génère .deb et .appimage)
npm run tauri:build:linux
```

**Formats générés** :
- `.deb` : Package Debian/Ubuntu
- `.appimage` : Application portable Linux

**Localisation** : `src-tauri/target/release/bundle/`

#### Build pour Windows

Sur une machine Windows :
```bash
# Build pour Windows (génère installeur NSIS)
npm run tauri:build:windows
```

**Format généré** :
- `.exe` : Installeur NSIS pour Windows

**Localisation** : `src-tauri/target/release/bundle/nsis/`

#### Prérequis Windows

Sur Windows, vous aurez besoin de :
- **Visual Studio Build Tools** 2019 ou plus récent
- **WebView2** (généralement déjà installé sur Windows 10/11)

Installation rapide :
```powershell
# Installer Rust
winget install Rustlang.Rust.MSVC

# Installer Node.js
winget install OpenJS.NodeJS

# Cloner et construire
git clone https://github.com/mateo-brl/powerlifting-manager.git
cd powerlifting-manager
npm install
npm run tauri:build:windows
```

#### Build universel

Pour construire sur la plateforme actuelle :
```bash
npm run tauri:build:all
```

**Note** : Le cross-compilation (build Windows depuis Linux ou inversement) n'est pas supporté nativement par Tauri. Il est recommandé de builder sur chaque plateforme cible.

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
│   │       │   ├── WarmupDisplay.tsx
│   │       │   ├── WeightDeclarations.tsx
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

**Hommes**: 53kg (Sub-Junior/Junior), 59kg, 66kg, 74kg, 83kg, 93kg, 105kg, 120kg, +120kg
**Femmes**: 43kg (Sub-Junior/Junior), 47kg, 52kg, 57kg, 63kg, 69kg, 76kg, 84kg, +84kg

**Catégories d'âge**: Sub-Junior, Junior, Seniors (24-39 ans, FFForce), Sub-Master, Open, Master 1, Master 2, Master 3, Master 4

**Divisions** :
- **Raw** : Sans équipement (seule ceinture autorisée)
- **Wraps** : Raw avec genouillères autorisées
- **Single-Ply** : Équipement single-ply
- **Multi-Ply** : Équipement multi-ply
- **Equipped** : Équipé (ancien terme générique)

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
  - **"Open Warmup Room"** → Écran salle de chauffe (ordre de passage, 3 tentatives)
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
- ✅ **Phase 6**: Catégories & Divisions complètes
  - Ajout catégories 43kg (F) et 53kg (M) Sub-Junior/Junior
  - Ajout catégorie Seniors (24-39 ans) FFForce
  - Support divisions Wraps, Single-Ply, Multi-Ply
- ✅ **Phase 7**: Exports & Documents officiels
  - Export PDF des résultats et feuilles imprimables
  - Export CSV OpenPowerlifting (archivage mondial)
  - Export FFForce (feuille de match officielle France)
  - Génération automatique de certificats de podium
  - Certificats de participation personnalisés
- ✅ **Phase 8**: Système de Records
  - Base de données de records (mondial/national/régional/personnel)
  - Détection automatique en temps réel
  - Notifications visuelles animées
  - Historique des records battus
- ✅ **Phase 9**: Coefficient McCulloch pour Masters
  - Formule polynomiale officielle pour athlètes 40+ ans
  - Ajustement automatique des totaux selon l'âge
  - Coefficients distincts hommes/femmes (1.01 à 2.60+)
  - Classements Masters avec totaux ajustés
- ✅ **Phase 10**: Gestion Multi-Plateformes
  - Support de plusieurs plateformes simultanées
  - Système de synchronisation automatique
  - Fusion intelligente des résultats avec résolution de conflits
  - Interface de gestion avec statistiques en temps réel
- ✅ **Phase 11**: Statistiques & Analytics Avancées
  - Historique de progression des athlètes
  - Comparaisons historiques entre compétitions
  - Graphiques de performance avec Recharts
  - Dashboard statistiques avec KPIs et tendances
  - Calculs avancés (quartiles, médianes, distributions)
- ✅ **Phase 12**: Affichages Publics Améliorés
  - Écran classements en direct pour affichage mural
  - 4 overlays streaming compatibles OBS
  - Support complet drapeaux, logos, photos
  - Intégration média dans tous les affichages
- ✅ **Phase 13**: Support Multi-Plateformes
  - Build Linux (.deb, .appimage) ✅
  - Build Windows (NSIS installer) ✅
  - Scripts de build automatisés
  - Documentation complète pour chaque plateforme
- ✅ **Phase 14**: Système de Protestations & Validation Équipement
  - Backend Rust avec commandes Tauri (Phase 0-1)
  - Types TypeScript et constantes IPF (Phase 2)
  - Composants React : ProtestModal, JuryPanel, EquipmentValidator (Phase 3)
  - Exports PDF/CSV des protestations et équipements (Phase 4)
  - Traductions i18n complètes FR/EN (Phase 5)
- 🔄 **Évolutions futures**:
  - Interface d'administration des records
  - Support macOS (.dmg, .app)
  - Module de planification de compétitions
  - API REST pour intégrations tierces

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
