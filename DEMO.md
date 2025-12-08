# 🎯 Guide de Démonstration - Powerlifting Manager

Ce guide explique comment utiliser la fonctionnalité de génération de données factices pour tester rapidement toutes les fonctionnalités de l'application.

---

## 🚀 Démarrage Rapide

### 1. Lancer l'Application

```bash
npm run tauri:dev
```

### 2. Accéder au Dashboard

L'application s'ouvre directement sur le Dashboard (`/`).

### 3. Générer une Compétition de Démo

Sur le Dashboard, vous verrez une carte **"Démo Rapide"** avec :
- Un sélecteur pour le nombre d'athlètes (5-50, défaut: 20)
- Un bouton **"Générer Compétition de Démo"**

Cliquez sur le bouton pour générer automatiquement :
- ✅ Une compétition avec nom, date et lieu
- ✅ 20 athlètes avec statistiques réalistes
- ✅ Pesées complètes pour tous les athlètes
- ✅ Tentatives factices pour démonstration

---

## 📋 Données Générées

### Compétition
- **Nom** : "Championnat [Ville] [Année]"
- **Date** : Date dans les 30 prochains jours
- **Lieu** : Ville française aléatoire
- **Fédération** : IPF
- **Statut** : upcoming

### Athlètes (20 par défaut)
- **Noms** : Prénoms et noms français
- **Genre** : 70% hommes, 30% femmes
- **Catégories de poids** :
  - Hommes : 59, 66, 74, 83, 93, 105, 120, 120+
  - Femmes : 47, 52, 57, 63, 69, 76, 84, 84+
- **Division** : 80% raw, 20% equipped
- **Âge** : 20-50 ans (junior, open, master1/2/3)
- **Numéros de lot** : 4 lots équilibrés
- **Hauteurs de rack** : Valeurs réalistes (10-18 pour squat, 6-12 pour bench)

### Pesées
- **Poids corporel** : Réaliste selon la catégorie
  - Classes limitées : 0.5-3kg sous la limite
  - Classes illimitées : 5-15kg au-dessus de la limite
- **Tentatives d'ouverture** :
  - Squat : ~1.5x poids de corps (H), ~1.1x (F)
  - Bench : ~70% du squat
  - Deadlift : ~110% du squat
  - Minimum 20kg, arrondi à 2.5kg

### Tentatives (jusqu'à 30 pour la démo)
- **Répartition** : Squat → Bench → Deadlift
- **Progression** : +5-10kg pour 2ème tentative, +10-15kg pour 3ème
- **Résultats** : Générés aléatoirement (80% succès, 20% échec)

---

## 🎮 Parcours de Test Recommandé

### Étape 1 : Génération
1. Sur le Dashboard, générez une compétition de démo
2. Notez le message de succès avec le nom de la compétition

### Étape 2 : Navigation
Utilisez les boutons de navigation rapide :

#### Voir la Compétition
- Affiche les détails de la compétition
- Liste des athlètes inscrits
- Statistiques générales

#### Pesée
- Visualisez les pesées déjà enregistrées
- Modifiez ou ajoutez des pesées
- Validation de catégorie de poids en temps réel

#### Gestion en Direct ⭐
**C'est ici que la magie opère !**

1. **Sélectionnez un mouvement** : Squat, Bench Press ou Deadlift
2. **Cliquez sur "Start"** pour commencer
3. **AttemptTracker** :
   - Voyez l'athlète actuel avec toutes ses infos
   - Ajustez le poids si nécessaire
   - Votez avec les 3 arbitres (Good Lift / No Lift)
   - Le résultat est calculé automatiquement (2/3 = succès)
   - Passez automatiquement à la tentative suivante
4. **Timer** : 60 secondes avec alertes à 30s, 15s, 10s
5. **Ordre de Passage** : Visualisez les prochains athlètes

#### Classements
- **Par Catégorie** : Classement dans chaque catégorie de poids
- **Absolu** : Classement général basé sur IPF GL Points
- **Filtres** : Par genre et catégorie de poids
- **Scores affichés** :
  - Meilleurs lifts (squat, bench, deadlift)
  - Total
  - IPF GL Points
  - DOTS
  - Wilks

---

## 🎯 Scénarios de Test

### Test Complet de Flux de Compétition

1. **Génération de Démo** ✓
2. **Vérification des Pesées** ✓
3. **Calcul des Flights** (Phase 2)
4. **Gestion des Tentatives en Direct** :
   - Commencer par Squat
   - Enregistrer 5-10 tentatives avec votes d'arbitres
   - Changer pour Bench Press
   - Enregistrer quelques tentatives
   - Passer à Deadlift
5. **Visualisation des Classements** :
   - Vérifier le podium
   - Comparer les scores (DOTS, Wilks, IPF GL)
   - Filtrer par catégorie

### Test des Règles IPF

1. **Ordre de Passage** :
   - Vérifier tri par poids croissant
   - Vérifier tri par lot à poids égal
   - Vérifier changement de tentative (jusqu'à 3 athlètes avant)

2. **Validation de Poids** :
   - Minimum 2.5kg d'augmentation
   - Pas de baisse de poids
   - Minimum 20kg pour première tentative

3. **Arbitrage** :
   - 3/3 lumières vertes = Succès ✓
   - 2/3 lumières vertes = Succès ✓
   - 1/3 ou 0/3 lumières vertes = Échec ✗

---

## 📊 Formules de Calcul

Toutes les formules sont implémentées et testées :

### IPF GL Points (Formule 2020)
```
IPF GL = (100 / (A + B×BW + C×BW² + D×BW³)) × Total
```

### DOTS
```
DOTS = (500 / (E + D×BW + C×BW² + B×BW³ + A×BW⁴)) × Total
```

### Wilks (2020)
```
Wilks = (500 / (a + b×BW + c×BW² + d×BW³ + e×BW⁴ + f×BW⁵)) × Total
```

---

## 🔄 Régénération de Données

Pour tester différents scénarios :

1. **Supprimer les données** : Relancez l'application (données en mémoire)
2. **Générer une nouvelle compétition** : Cliquez à nouveau sur "Générer Compétition de Démo"
3. **Ajuster le nombre d'athlètes** : Utilisez le sélecteur (5-50 athlètes)

---

## 🐛 Dépannage

### La génération échoue
- Vérifiez que Tauri est bien démarré
- Vérifiez la console pour les erreurs
- Relancez l'application

### Les tentatives ne s'affichent pas
- Assurez-vous d'avoir généré une compétition
- Vérifiez que la pesée a été complétée
- Sélectionnez le bon mouvement (squat/bench/deadlift)

### Les scores sont à 0
- Les scores sont calculés uniquement si le total > 0
- Assurez-vous d'avoir des tentatives réussies
- Vérifiez les 3 mouvements

---

## 📝 Notes Techniques

- **Stockage** : SQLite persistant (les données sont conservées entre les sessions)
- **Performance** : Génération instantanée de 20-50 athlètes
- **Localisation** : Noms et villes français pour réalisme
- **Règles IPF** : Respect strict des règlements IPF
- **Base de données** : `powerlifting.db` dans le dossier de l'application

---

## 🎓 Fonctionnalités à Tester

### Phase 1 ✅
- [x] CRUD Compétitions
- [x] CRUD Athlètes
- [x] Navigation et routing

### Phase 2 ✅
- [x] Pesée avec validation
- [x] Calcul automatique des flights
- [x] Ordre de passage IPF
- [x] Timer de compétition

### Phase 3 ✅
- [x] Gestion des tentatives en temps réel
- [x] Système d'arbitrage (3 lumières)
- [x] Calcul des scores (DOTS, Wilks, IPF GL)
- [x] Classements en direct
- [x] Interface de compétition complète

---

### Phase 4 ✅
- [x] Génération de PDF (scoresheets)
- [x] Export CSV / Excel
- [x] Export format OpenPowerlifting
- [x] Export FFForce officiel
- [x] Certificats de podium et participation

### Phase 5+ ✅
- [x] Protestations IPF
- [x] Validation équipement
- [x] Affichage externe WebSocket
- [x] Écrans Spotters et Salle de Chauffe
- [x] Overlays OBS
- [x] Dark mode
- [x] Auto-updater

---

**Bon test ! 💪🏋️**

Pour toute question ou problème, consultez les logs de la console ou vérifiez le code source dans `src/shared/utils/mockData.ts`.
