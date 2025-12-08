# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

> **Note** : Les futurs changelogs seront générés automatiquement par [git-cliff](https://git-cliff.org/) lors des releases.

---

## [Unreleased]

---

## [0.1.0] - 2025-12-08

### Added

#### CI/CD & Distribution
- Pipeline CI/CD avec GitHub Actions
- Auto-updater intégré avec interface utilisateur
- Génération automatique du changelog (git-cliff)
- Checksums SHA256 pour les releases

#### Core Features
- Gestion complète des compétitions (CRUD)
- Gestion des athlètes (CRUD + Import/Export CSV)
- Module de pesée avec validation IPF
- Système de flights automatique
- Compétition en direct avec timer 60s
- Système d'arbitrage IPF (3 juges, lumières blanc/rouge)
- Déclarations de poids avec validation
- Calculs de scores (IPF GL, DOTS, Wilks)
- Coefficient McCulloch pour Masters
- Support Full Power (SBD) et Bench Only

#### Affichages
- Affichage externe temps réel (WebSocket)
- Écran Spotters (chargement de barre IPF)
- Écran Salle de Chauffe
- Overlays OBS pour streaming
- Écran de classements en direct

#### Exports
- Export PDF résultats
- Export CSV OpenPowerlifting
- Export FFForce officiel
- Certificats de podium et participation

#### Conformité
- Système de protestations IPF (60s)
- Validation équipement avec marques approuvées IPF
- Gestion multi-plateformes
- Interface bilingue FR/EN

#### Tests & Qualité
- 120 tests unitaires (Vitest)
- Coverage 82.9% sur les fonctions critiques
- Tests E2E avec Playwright

#### UX/UI
- Thème personnalisé powerlifting (rouge/noir/blanc)
- Dark mode avec détection système
- Raccourcis clavier (G/R/N/P/?)
- Design responsive pour tablettes
- Animations CSS fluides

#### Distribution
- Build Windows (NSIS installer)
- Build macOS (DMG)
- Build Linux (DEB, AppImage)

### Changed
- Amélioration du thème UI et de l'ordre des flux de compétition

### Fixed
- Correction du passage automatique à l'athlète suivant après validation
- Amélioration du support des thèmes et de la persistance des déclarations de poids
- Correction de l'import redondant de chrono (avertissement clippy)
- Correction du nom de l'action rust-toolchain dans les workflows CI

---

## Types de changements

- **Added** : Nouvelles fonctionnalités
- **Changed** : Modifications de fonctionnalités existantes
- **Deprecated** : Fonctionnalités qui seront supprimées
- **Removed** : Fonctionnalités supprimées
- **Fixed** : Corrections de bugs
- **Security** : Corrections de vulnérabilités
