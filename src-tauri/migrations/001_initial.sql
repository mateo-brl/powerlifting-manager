-- Migration initiale pour Powerlifting Manager
-- Schéma de base de données SQLite

CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT,
    federation TEXT DEFAULT 'IPF',
    status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'active', 'completed')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS athletes (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('M', 'F')),
    weight_class TEXT NOT NULL,
    division TEXT NOT NULL DEFAULT 'raw' CHECK(division IN ('raw', 'equipped')),
    age_category TEXT NOT NULL,
    lot_number INTEGER,
    bodyweight REAL,
    squat_rack_height INTEGER,
    bench_rack_height INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY,
    athlete_id TEXT NOT NULL,
    lift_type TEXT NOT NULL CHECK(lift_type IN ('squat', 'bench', 'deadlift')),
    attempt_number INTEGER NOT NULL CHECK(attempt_number BETWEEN 1 AND 3),
    weight_kg REAL NOT NULL,
    successful INTEGER NOT NULL DEFAULT 0 CHECK(successful IN (0, 1)),
    referee_lights TEXT, -- JSON: [true, true, false]
    timestamp TEXT NOT NULL,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    UNIQUE(athlete_id, lift_type, attempt_number)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_athletes_competition ON athletes(competition_id);
CREATE INDEX IF NOT EXISTS idx_attempts_athlete ON attempts(athlete_id);
CREATE INDEX IF NOT EXISTS idx_attempts_lift_type ON attempts(lift_type);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_date ON competitions(date);
