-- Migration pour le système de gestion des records
-- Gestion des records nationaux, régionaux, personnels

CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    record_type TEXT NOT NULL CHECK(record_type IN ('national', 'regional', 'personal', 'world')),
    federation TEXT NOT NULL,
    country TEXT,
    region TEXT,
    gender TEXT NOT NULL CHECK(gender IN ('M', 'F')),
    weight_class TEXT NOT NULL,
    division TEXT NOT NULL CHECK(division IN ('raw', 'wraps', 'single-ply', 'multi-ply', 'equipped')),
    age_category TEXT NOT NULL,
    lift_type TEXT NOT NULL CHECK(lift_type IN ('squat', 'bench', 'deadlift', 'total')),
    weight_kg REAL NOT NULL,
    athlete_name TEXT NOT NULL,
    date_set TEXT NOT NULL,
    competition_name TEXT,
    verified INTEGER DEFAULT 0 CHECK(verified IN (0, 1)),
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Table pour historique des records battus
CREATE TABLE IF NOT EXISTS record_attempts (
    id TEXT PRIMARY KEY,
    record_id TEXT NOT NULL,
    attempt_id TEXT NOT NULL,
    athlete_id TEXT NOT NULL,
    competition_id TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    successful INTEGER NOT NULL CHECK(successful IN (0, 1)),
    approached INTEGER DEFAULT 0 CHECK(approached IN (0, 1)), -- Record approché à moins de 2.5kg
    timestamp TEXT NOT NULL,
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_records_type ON records(record_type);
CREATE INDEX IF NOT EXISTS idx_records_federation ON records(federation);
CREATE INDEX IF NOT EXISTS idx_records_category ON records(gender, weight_class, division);
CREATE INDEX IF NOT EXISTS idx_records_lift ON records(lift_type);
CREATE INDEX IF NOT EXISTS idx_record_attempts_record ON record_attempts(record_id);
CREATE INDEX IF NOT EXISTS idx_record_attempts_athlete ON record_attempts(athlete_id);
CREATE INDEX IF NOT EXISTS idx_record_attempts_competition ON record_attempts(competition_id);
