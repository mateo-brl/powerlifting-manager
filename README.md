# Powerlifting Manager

Application desktop professionnelle pour gérer des compétitions de powerlifting de A à Z.

## 🏋️ Description

Powerlifting Manager est une solution complète pour organiser et gérer des compétitions de powerlifting conformes aux règles IPF (International Powerlifting Federation) et autres fédérations.

## 🚀 Stack Technique

- **Framework Desktop**: Tauri 2.x
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Ant Design 5.x
- **State Management**: Zustand
- **Database**: SQLite (via tauri-plugin-sql)
- **Validation**: Zod
- **PDF/Excel**: Puppeteer, PDFKit, ExcelJS

## 📋 Fonctionnalités

### Phase 1 - Base (✅ Complétée)
- ✅ Setup projet Tauri + React + TypeScript
- ✅ Configuration SQLite avec migrations
- ✅ Structures de données (Competition, Athlete, Attempt)
- ✅ Stores Zustand pour state management
- ✅ Commands Rust pour CRUD

### Phase 2 - En cours
- [ ] CRUD Compétitions (UI)
- [ ] CRUD Athlètes (UI)
- [ ] Import CSV d'athlètes
- [ ] Module de pesée (weigh-in)
- [ ] Validation Zod

### Phase 3 - Planifié
- [ ] Calcul automatique des flights
- [ ] Ordre de passage automatique
- [ ] Timer de compétition
- [ ] Gestion des tentatives avec 3 lumières

### Phase 4 - Planifié
- [ ] WebSocket pour affichage temps réel
- [ ] Calcul des scores (Wilks, DOTS, IPF GL)
- [ ] Génération PDF/Excel
- [ ] Export OpenPowerlifting

## 🛠️ Installation

### Prérequis
- Node.js 18+ et npm
- Rust 1.70+
- Tauri CLI

### Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run tauri:dev

# Build de production
npm run tauri:build
```

## 📊 Schéma de Base de Données

### Competitions
- Gestion des informations de compétition
- Support multi-fédérations (IPF, USAPL, USPA, FFForce)
- Statuts: upcoming, active, completed

### Athletes
- Informations personnelles des athlètes
- Catégories de poids IPF
- Divisions: raw, equipped
- Hauteurs de racks

### Attempts
- Suivi des tentatives (squat, bench, deadlift)
- 3 tentatives par mouvement
- Lumières des arbitres (3 votes)

## 📐 Catégories de Poids IPF

**Hommes**: 59kg, 66kg, 74kg, 83kg, 93kg, 105kg, 120kg, +120kg
**Femmes**: 47kg, 52kg, 57kg, 63kg, 69kg, 76kg, 84kg, +84kg

## 🧮 Calculs de Scores

L'application supporte:
- **IPF GL Points** (formule 2020)
- **Wilks** (formule classique)
- **DOTS** (nouvelle formule)

## 🤝 Contribution

Projet développé par [@mateobrl](https://github.com/mateobrl)

## 📝 Licence

Propriétaire - Tous droits réservés

## 🎯 Roadmap

- **Semaine 1**: Setup + CRUD de base ✅
- **Semaine 2**: Logique métier (pesée, flights)
- **Semaine 3**: Temps réel (WebSocket, affichage)
- **Semaine 4**: Documents (PDF, Excel) + Tests

## 📞 Support

Pour toute question: mateobaril.pro@gmail.com
