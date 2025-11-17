# TODO - Powerlifting Manager

## 🔥 Urgent - Setup Initial

- [x] **Installer Rust** ✅
  - `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - Vérifier : `cargo --version`

- [x] **Installer dépendances système Tauri** ✅
  - Ubuntu/Debian : `sudo apt install libwebkit2gtk-4.1-dev ...`

- [x] **Compiler le projet Rust** ✅
  - `cd src-tauri && cargo build`

- [x] **Créer repository GitHub** ✅
  - Nom : powerlifting-manager
  - Visibilité : Public
  - URL : https://github.com/mateobrl/powerlifting-manager
  - `git push -u origin main`

- [x] **Tester le lancement** ✅
  - Mode navigateur fonctionnel avec `npm run dev`
  - Wrapper Tauri créé pour compatibilité navigateur/natif

---

## 📦 Phase 1 - CRUD de Base ✅ COMPLÉTÉ

### Backend - Connexion SQLite

- [x] Implémenter stockage en mémoire pour développement ✅
- [x] Implémenter `create_competition` ✅
- [x] Implémenter `get_competitions` ✅
- [x] Implémenter `update_competition` ✅
- [x] Implémenter `delete_competition` ✅
- [x] Implémenter les fonctions CRUD Athlete ✅
- [x] Mode navigateur avec tauriWrapper.ts ✅

### Frontend - UI Compétitions

- [x] Créer `CompetitionList.tsx` ✅
  - Table Ant Design avec colonnes : nom, date, lieu, fédération, statut
  - Boutons : Nouveau, Éditer, Supprimer, Voir détails
  - Filtres et recherche

- [x] Créer `CompetitionForm.tsx` ✅
  - Champs : nom, date (DatePicker), lieu, fédération (Select)
  - Validation Zod
  - Appel à `create_competition` ou `update_competition`

- [x] Créer `CompetitionDetail.tsx` ✅
  - Vue détaillée d'une compétition
  - Liste des athlètes inscrits
  - Actions : Démarrer pesée, Gérer tentatives

- [x] Intégrer avec le store Zustand ✅
  - Charger les compétitions au mount
  - Mettre à jour après création/modification

### Frontend - UI Athlètes

- [x] Créer `AthleteList.tsx` ✅
  - Table avec colonnes : nom, prénom, catégorie, poids, lot
  - Filtres par catégorie, sexe

- [x] Créer `AthleteForm.tsx` ✅
  - Champs : nom, prénom, date de naissance, sexe
  - Sélection catégorie de poids (dynamique selon sexe)
  - Division (raw/equipped)
  - Validation selon règles IPF

- [x] Créer `AthleteImport.tsx` ✅
  - Upload CSV
  - Preview des données
  - Validation et import en masse
  - Format : nom, prénom, date_naissance, sexe, catégorie

### Routing et Navigation

- [x] Installer React Router ✅
- [x] Créer routes ✅
  - `/` - Dashboard
  - `/competitions` - Liste des compétitions
  - `/competitions/:id` - Détails compétition
  - `/competitions/:id/athletes` - Athlètes d'une compétition
  - `/athletes/new` - Formulaire athlète
  - `/weigh-in` - Module de pesée
  - `/live` - Compétition en direct

- [x] Créer Layout avec menu de navigation ✅
- [x] Ajouter onglet "Competition Actions" avec cartes cliquables ✅
- [x] Ajouter boutons "Back" dans toutes les pages de gestion ✅

---

## 🎯 Phase 2 - Logique Métier ✅ COMPLÉTÉ

### Module de Pesée (Weigh-in)

- [x] Créer `src/features/weigh-in/components/WeighInForm.tsx` ✅
  - Sélection athlète
  - Input poids corporel
  - Validation catégorie de poids
  - Inputs tentatives d'ouverture (squat, bench, deadlift)
  - Hauteurs de racks

- [x] Créer store Zustand pour weigh-in ✅
- [x] Créer commands Rust pour enregistrer weigh-in ✅
- [x] Validation des tentatives selon règles IPF ✅

### Calcul des Flights (Groupes)

- [x] Créer algorithme de répartition en flights ✅
  - Par catégorie de poids
  - Par nombre d'athlètes (max 14 par flight recommandé)
  - Équilibrer les groupes

- [x] UI pour visualiser et ajuster les flights ✅
- [ ] Stocker les flights en DB (actuellement en mémoire)

### Ordre de Passage

- [x] Implémenter logique d'ordre de passage IPF ✅
  1. Par poids demandé (croissant)
  2. À poids égal : par numéro de lot
  3. Permettre changements jusqu'à 3 athlètes avant

- [x] Créer `AttemptOrderList.tsx` ✅
  - Liste ordonnée des tentatives
  - Highlight athlète actuel
  - 3 prochains athlètes

### Timer de Compétition

- [x] Créer composant Timer ✅
  - Countdown 60 secondes
  - Start/Pause/Reset
  - Alerte visuelle avec changement de couleur
  - Intégration dans LiveCompetition

- [x] Synchroniser avec tentatives ✅

---

## ⚡ Phase 3 - Temps Réel ✅ COMPLÉTÉ

### Gestion des Tentatives

- [x] Créer `AttemptTracker.tsx` ✅
  - Athlète actuel
  - Poids demandé
  - 3 boutons lumières (arbitres)
  - Valider tentative (réussie si 2/3 ou 3/3)
  - Auto-calcul du résultat basé sur les votes

- [x] Stocker tentatives en DB ✅
- [x] Calculer prochaine tentative automatiquement ✅

### Interface de Compétition Live

- [x] Créer `LiveCompetition.tsx` ✅
  - Sélection du mouvement (Squat/Bench/Deadlift)
  - Affichage de l'ordre de passage
  - Intégration Timer
  - Suivi des tentatives en temps réel

- [x] Créer `Rankings.tsx` ✅
  - Classement live par catégorie
  - Classement absolu
  - Tous les scores (Total, DOTS, Wilks, IPF GL)

### WebSocket pour Affichage

- [ ] Implémenter WebSocket serveur en Rust
- [ ] Créer events : athlete_up, attempt_result, rankings_update
- [ ] Créer pages d'affichage (fullscreen)

### Calcul des Scores

- [x] Implémenter formule DOTS complète ✅
- [x] Implémenter formule Wilks complète ✅
- [x] Calculer total (meilleur squat + bench + deadlift) ✅
- [x] Calculer IPF GL Points ✅
- [x] Classement par catégorie ✅
- [x] Classement absolu ✅

### Démo et Tests

- [x] Créer `DemoDataInitializer.tsx` ✅
  - Génération automatique de compétition de test
  - 20+ athlètes avec données réalistes
  - Pesées et tentatives pré-remplies
  - Documentation complète (DEMO.md) ✅

- [x] Créer `mockData.ts` ✅
  - Générateur de données factices
  - Noms français réalistes
  - Poids et catégories cohérents

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

- [x] Implémenter export CSV complet ✅
- [x] Export des classements avec tous les scores ✅
  - Rank, Name, Gender, Weight Class, Bodyweight
  - Best Squat, Bench, Deadlift, Total
  - IPF GL Points, DOTS, Wilks

### Export OpenPowerlifting

- [x] Créer CSV format OpenPowerlifting ✅
- [x] Colonnes conformes au format officiel ✅
  - Name, Sex, Event, Equipment, Age, Division
  - BodyweightKg, WeightClassKg
  - Squat1Kg, Squat2Kg, Squat3Kg, Best3SquatKg
  - Bench1Kg, Bench2Kg, Bench3Kg, Best3BenchKg
  - Deadlift1Kg, Deadlift2Kg, Deadlift3Kg, Best3DeadliftKg
  - TotalKg, Place, Dots, Wilks, Goodlift

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

## 📊 Résumé des Progrès

**Phases complétées** :
- ✅ Phase 0 - Setup Initial (100%)
- ✅ Phase 1 - CRUD de Base (100% - import CSV complété)
- ✅ Phase 2 - Logique Métier (95% - flights en mémoire, manque persistance DB)
- ✅ Phase 3 - Temps Réel (90% - manque WebSocket)
- 🔄 Phase 4 - Documents (40% - exports CSV/OpenPowerlifting complétés, manque PDF)

**Fonctionnalités clés implémentées** :
- ✅ Gestion complète des compétitions et athlètes
- ✅ Import/Export CSV des athlètes
- ✅ Module de pesée fonctionnel
- ✅ Système de tentatives avec votes d'arbitres (3 lumières)
- ✅ Calculs de scores (DOTS, Wilks, IPF GL)
- ✅ Classements live (catégorie + absolu)
- ✅ Export Excel des classements complets
- ✅ Export format OpenPowerlifting officiel
- ✅ Timer de compétition
- ✅ Gestion des flights automatique
- ✅ Navigation améliorée avec onglet "Competition Actions"
- ✅ Boutons de retour dans toutes les pages
- ✅ Mode démo avec données factices
- ✅ Compatible navigateur ET application native Tauri

**Prochaines étapes prioritaires** :
1. Export PDF (feuilles de route, résultats)
2. WebSocket pour affichage externe
3. Persistance des flights en DB
4. Tests unitaires et E2E
5. Polish UX (dark mode, i18n, thème personnalisé)
6. Build et distribution (Windows, Linux)
7. Documentation utilisateur complète
8. Vidéo de démonstration

---

**Dernière mise à jour** : 2025-11-17 - Exports Excel & OpenPowerlifting ✅
