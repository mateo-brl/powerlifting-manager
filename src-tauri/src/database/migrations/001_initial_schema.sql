-- Migration 001: Initial schema for powerlifting manager
-- Creates all core tables for competitions, athletes, weigh-ins, attempts, and flights

-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT,
    federation TEXT NOT NULL,
    format TEXT NOT NULL DEFAULT 'full_power', -- 'full_power', 'bench_only', 'push_pull'
    status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'in_progress', 'completed'
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_competitions_date ON competitions(date);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);

-- Athletes table
CREATE TABLE IF NOT EXISTS athletes (
    id TEXT PRIMARY KEY NOT NULL,
    competition_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL, -- 'M', 'F', 'MX'
    weight_class TEXT NOT NULL,
    division TEXT NOT NULL,
    age_category TEXT NOT NULL,
    lot_number INTEGER,
    bodyweight REAL,
    squat_rack_height INTEGER,
    bench_rack_height INTEGER,
    team TEXT,
    country TEXT DEFAULT 'FRA',
    team_logo TEXT,
    athlete_photo TEXT,
    out_of_competition INTEGER DEFAULT 0, -- Boolean: 0 = false, 1 = true
    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_athletes_competition ON athletes(competition_id);
CREATE INDEX IF NOT EXISTS idx_athletes_weight_class ON athletes(weight_class);
CREATE INDEX IF NOT EXISTS idx_athletes_division ON athletes(division);

-- Weigh-ins table
CREATE TABLE IF NOT EXISTS weigh_ins (
    id TEXT PRIMARY KEY NOT NULL,
    athlete_id TEXT NOT NULL,
    competition_id TEXT NOT NULL,
    bodyweight REAL NOT NULL,
    weighed_in_at TEXT NOT NULL,
    opening_squat REAL NOT NULL,
    opening_bench REAL NOT NULL,
    opening_deadlift REAL NOT NULL,
    squat_rack_height INTEGER,
    bench_rack_height INTEGER,
    bench_safety_height INTEGER,
    flight TEXT,
    lot_number INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_weigh_ins_athlete ON weigh_ins(athlete_id);
CREATE INDEX IF NOT EXISTS idx_weigh_ins_competition ON weigh_ins(competition_id);
CREATE INDEX IF NOT EXISTS idx_weigh_ins_flight ON weigh_ins(flight);

-- Attempts table
CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY NOT NULL,
    athlete_id TEXT NOT NULL,
    competition_id TEXT NOT NULL,
    lift_type TEXT NOT NULL, -- 'squat', 'bench', 'deadlift'
    attempt_number INTEGER NOT NULL, -- 1, 2, 3
    weight_kg REAL NOT NULL,
    result TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failure'
    referee_votes TEXT, -- JSON array: [true, false, true]
    timestamp TEXT,
    rack_height INTEGER,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    UNIQUE(athlete_id, lift_type, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_attempts_athlete ON attempts(athlete_id);
CREATE INDEX IF NOT EXISTS idx_attempts_competition ON attempts(competition_id);
CREATE INDEX IF NOT EXISTS idx_attempts_lift_type ON attempts(lift_type);

-- Flights table (for organizing athletes into lifting groups)
CREATE TABLE IF NOT EXISTS flights (
    id TEXT PRIMARY KEY NOT NULL,
    competition_id TEXT NOT NULL,
    name TEXT NOT NULL,
    athlete_ids TEXT NOT NULL, -- JSON array of athlete IDs: ["id1", "id2", ...]
    lift_type TEXT NOT NULL, -- 'squat', 'bench', 'deadlift'
    status TEXT NOT NULL, -- 'pending', 'in_progress', 'completed'
    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_flights_competition ON flights(competition_id);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
