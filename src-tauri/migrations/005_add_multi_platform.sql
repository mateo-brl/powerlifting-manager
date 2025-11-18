-- Migration pour support multi-plateformes
-- Permet de gérer plusieurs plateformes dans une même compétition

-- Table des plateformes
CREATE TABLE IF NOT EXISTS platforms (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    active INTEGER DEFAULT 1 CHECK(active IN (0, 1)),
    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

-- Ajouter la colonne platform_id aux tables existantes
-- Note: SQLite ne supporte pas ALTER TABLE ADD COLUMN avec FOREIGN KEY directement
-- On doit recréer les tables

-- Recréer la table athletes avec platform_id
CREATE TABLE IF NOT EXISTS athletes_new (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    platform_id TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('M', 'F')),
    weight_class TEXT NOT NULL,
    division TEXT NOT NULL DEFAULT 'raw' CHECK(division IN ('raw', 'wraps', 'single-ply', 'multi-ply', 'equipped')),
    age_category TEXT NOT NULL,
    lot_number INTEGER,
    bodyweight REAL,
    squat_rack_height INTEGER,
    bench_rack_height INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE SET NULL
);

-- Copier les données existantes (platform_id sera NULL)
INSERT INTO athletes_new
SELECT id, competition_id, NULL as platform_id, first_name, last_name, date_of_birth,
       gender, weight_class, division, age_category, lot_number, bodyweight,
       squat_rack_height, bench_rack_height, created_at
FROM athletes;

-- Supprimer l'ancienne table
DROP TABLE athletes;

-- Renommer la nouvelle table
ALTER TABLE athletes_new RENAME TO athletes;

-- Recréer la table attempts avec platform_id
CREATE TABLE IF NOT EXISTS attempts_new (
    id TEXT PRIMARY KEY,
    athlete_id TEXT NOT NULL,
    platform_id TEXT,
    lift_type TEXT NOT NULL CHECK(lift_type IN ('squat', 'bench', 'deadlift')),
    attempt_number INTEGER NOT NULL CHECK(attempt_number BETWEEN 1 AND 3),
    weight_kg REAL NOT NULL,
    successful INTEGER NOT NULL DEFAULT 0 CHECK(successful IN (0, 1)),
    referee_lights TEXT,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE SET NULL,
    UNIQUE(athlete_id, lift_type, attempt_number)
);

-- Copier les données existantes
INSERT INTO attempts_new
SELECT id, athlete_id, NULL as platform_id, lift_type, attempt_number,
       weight_kg, successful, referee_lights, timestamp
FROM attempts;

-- Supprimer l'ancienne table
DROP TABLE attempts;

-- Renommer
ALTER TABLE attempts_new RENAME TO attempts;

-- Table de synchronisation entre plateformes
CREATE TABLE IF NOT EXISTS platform_sync_log (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    source_platform_id TEXT NOT NULL,
    target_platform_id TEXT,
    sync_type TEXT NOT NULL CHECK(sync_type IN ('athlete_update', 'attempt_result', 'order_change')),
    data TEXT NOT NULL, -- JSON data
    synced INTEGER DEFAULT 0 CHECK(synced IN (0, 1)),
    timestamp TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (source_platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
    FOREIGN KEY (target_platform_id) REFERENCES platforms(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_platforms_competition ON platforms(competition_id);
CREATE INDEX IF NOT EXISTS idx_athletes_platform ON athletes(platform_id);
CREATE INDEX IF NOT EXISTS idx_attempts_platform ON attempts(platform_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_competition ON platform_sync_log(competition_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_source ON platform_sync_log(source_platform_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_synced ON platform_sync_log(synced);

-- Recréer les index sur athletes et attempts
CREATE INDEX IF NOT EXISTS idx_athletes_competition ON athletes(competition_id);
CREATE INDEX IF NOT EXISTS idx_attempts_athlete ON attempts(athlete_id);
CREATE INDEX IF NOT EXISTS idx_attempts_lift_type ON attempts(lift_type);
