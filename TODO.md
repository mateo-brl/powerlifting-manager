# TODO - Powerlifting Manager

## 🔥 Urgent - Setup Initial

- [ ] **Installer Rust** (voir SETUP_GUIDE.md)
  - `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - Vérifier : `cargo --version`

- [ ] **Installer dépendances système Tauri** (voir SETUP_GUIDE.md)
  - Ubuntu/Debian : `sudo apt install libwebkit2gtk-4.1-dev ...`

- [ ] **Compiler le projet Rust**
  - `cd src-tauri && cargo build`

- [ ] **Créer repository GitHub**
  - Nom : powerlifting-manager
  - Visibilité : Public
  - `git remote add origin https://github.com/mateobrl/powerlifting-manager.git`
  - `git push -u origin main`

- [ ] **Tester le lancement**
  - `npm run tauri:dev`

---

## 📦 Phase 1 - CRUD de Base (Semaine 1)

### Backend - Connexion SQLite

- [ ] Implémenter la connexion SQLite dans `src-tauri/src/database/mod.rs`
- [ ] Créer helper pour exécuter les migrations au démarrage
- [ ] Implémenter `create_competition` avec INSERT SQL
- [ ] Implémenter `get_competitions` avec SELECT SQL
- [ ] Implémenter `update_competition` avec UPDATE SQL
- [ ] Implémenter `delete_competition` avec DELETE SQL
- [ ] Implémenter les fonctions CRUD Athlete
- [ ] Tester les commands avec Tauri DevTools

### Frontend - UI Compétitions

- [ ] Créer `CompetitionList.tsx`
  - Table Ant Design avec colonnes : nom, date, lieu, fédération, statut
  - Boutons : Nouveau, Éditer, Supprimer, Voir détails
  - Filtres et recherche

- [ ] Créer `CompetitionForm.tsx`
  - Champs : nom, date (DatePicker), lieu, fédération (Select)
  - Validation Zod
  - Appel à `create_competition` ou `update_competition`

- [ ] Créer `CompetitionDetail.tsx`
  - Vue détaillée d'une compétition
  - Liste des athlètes inscrits
  - Actions : Démarrer pesée, Gérer tentatives

- [ ] Intégrer avec le store Zustand
  - Charger les compétitions au mount
  - Mettre à jour après création/modification

### Frontend - UI Athlètes

- [ ] Créer `AthleteList.tsx`
  - Table avec colonnes : nom, prénom, catégorie, poids, lot
  - Filtres par catégorie, sexe
  - Export CSV

- [ ] Créer `AthleteForm.tsx`
  - Champs : nom, prénom, date de naissance, sexe
  - Sélection catégorie de poids (dynamique selon sexe)
  - Division (raw/equipped)
  - Validation selon règles IPF

- [ ] Créer `AthleteImport.tsx`
  - Upload CSV
  - Preview des données
  - Validation et import en masse
  - Format : nom, prénom, date_naissance, sexe, catégorie

### Routing et Navigation

- [ ] Installer React Router (`npm install react-router-dom`)
- [ ] Créer routes :
  - `/` - Dashboard
  - `/competitions` - Liste des compétitions
  - `/competitions/:id` - Détails compétition
  - `/competitions/:id/athletes` - Athlètes d'une compétition
  - `/athletes/new` - Formulaire athlète

- [ ] Créer Layout avec menu de navigation

---

## 🎯 Phase 2 - Logique Métier (Semaine 2)

### Module de Pesée (Weigh-in)

- [ ] Créer `src/features/weigh-in/components/WeighInForm.tsx`
  - Sélection athlète
  - Input poids corporel
  - Validation catégorie de poids
  - Inputs tentatives d'ouverture (squat, bench, deadlift)
  - Hauteurs de racks

- [ ] Créer store Zustand pour weigh-in
- [ ] Créer commands Rust pour enregistrer weigh-in
- [ ] Valider les tentatives d'ouverture selon règles IPF
  - Minimum 2.5kg d'écart entre tentatives
  - Tentative 1 > 0

### Calcul des Flights (Groupes)

- [ ] Créer algorithme de répartition en flights
  - Par catégorie de poids
  - Par nombre d'athlètes (max 14 par flight recommandé)
  - Équilibrer les groupes

- [ ] UI pour visualiser et ajuster les flights
- [ ] Stocker les flights en DB

### Ordre de Passage

- [ ] Implémenter logique d'ordre de passage IPF :
  1. Par poids demandé (croissant)
  2. À poids égal : par numéro de lot
  3. Permettre changements jusqu'à 3 athlètes avant

- [ ] Créer `AttemptOrderList.tsx`
  - Liste ordonnée des tentatives
  - Highlight athlète actuel
  - 3 prochains athlètes

### Timer de Compétition

- [ ] Créer composant Timer
  - Countdown 60 secondes
  - Start/Pause/Reset
  - Alerte à 30s, 15s, 10s
  - Son/notification à 0

- [ ] Synchroniser avec tentatives

---

## ⚡ Phase 3 - Temps Réel (Semaine 3)

### Gestion des Tentatives

- [ ] Créer `AttemptTracker.tsx`
  - Athlète actuel
  - Poids demandé
  - 3 boutons lumières (arbitres)
  - Valider tentative (réussie si 2/3 ou 3/3)

- [ ] Stocker tentatives en DB
- [ ] Calculer prochaine tentative automatiquement

### WebSocket pour Affichage

- [ ] Implémenter WebSocket serveur en Rust
- [ ] Créer events : athlete_up, attempt_result, rankings_update
- [ ] Créer pages d'affichage (fullscreen) :
  - Athlète actuel (nom, catégorie, tentative, poids)
  - Ordre de passage (prochains 5)
  - Classement live

### Calcul des Scores

- [ ] Implémenter formule DOTS (compléter `calculations.ts`)
- [ ] Implémenter formule Wilks
- [ ] Calculer total (meilleur squat + bench + deadlift)
- [ ] Calculer IPF GL Points
- [ ] Classement par catégorie
- [ ] Classement absolu

---

## 📄 Phase 4 - Documents (Semaine 4)

### Génération PDF

- [ ] Installer Puppeteer ou alternative Tauri
- [ ] Template Scoresheet (feuille de route)
  - Informations athlète
  - Grille des tentatives
  - Signatures arbitres

- [ ] Template Résultats
  - Classement par catégorie
  - Top performers
  - Records

### Export Excel

- [ ] Implémenter export avec ExcelJS
- [ ] Feuilles :
  - Athlètes inscrits
  - Tentatives
  - Résultats
  - Statistiques

### Export OpenPowerlifting

- [ ] Créer CSV format OpenPowerlifting
- [ ] Colonnes : Name, Sex, Event, Equipment, Age, Division, BodyweightKg, WeightClassKg, Squat1Kg, ...

---

## 🧪 Tests et Qualité

- [ ] Setup Vitest
- [ ] Tests unitaires :
  - Fonctions de calcul (IPF GL, DOTS, Wilks)
  - Validation de catégorie de poids
  - Algorithme d'ordre de passage

- [ ] Setup Playwright pour tests E2E
- [ ] Tests E2E :
  - Créer compétition
  - Ajouter athlètes
  - Simuler pesée
  - Enregistrer tentatives

---

## 🎨 Polish et UX

- [ ] Thème personnalisé Ant Design (couleurs powerlifting)
- [ ] Dark mode
- [ ] Internationalisation (i18n) FR/EN
- [ ] Raccourcis clavier
- [ ] Mode hors ligne complet
- [ ] Sauvegarde automatique
- [ ] Confirmation avant suppressions

---

## 📦 Build et Distribution

- [ ] Icons application (générer toutes tailles)
- [ ] Configurer code signing (optionnel)
- [ ] Build Windows : `npm run tauri:build`
- [ ] Build Linux : `npm run tauri:build`
- [ ] Tester les installateurs
- [ ] Créer releases GitHub

---

## 📝 Documentation

- [ ] Guide utilisateur (markdown)
- [ ] Vidéo démo
- [ ] Screenshots
- [ ] Documentation API Tauri commands
- [ ] Guide de contribution
- [ ] Changelog

---

**Dernière mise à jour** : Phase 1 setup initial terminé ✅
