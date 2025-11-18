-- Migration pour ajouter les champs média et l'historique
-- Ajoute: country, team_logo, athlete_photo aux athlètes
-- Crée: table athlete_history pour statistiques et comparaisons

-- 1. Ajouter les champs média à la table athletes
-- SQLite ne supporte pas ALTER COLUMN, donc on recrée la table

CREATE TABLE IF NOT EXISTS athletes_new (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
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
    -- Nouveaux champs média
    country TEXT,              -- Code pays (ex: FRA, USA, GBR)
    team_logo TEXT,            -- URL ou chemin vers le logo de l'équipe
    athlete_photo TEXT,        -- URL ou chemin vers la photo de l'athlète
    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

-- Copier les données existantes
INSERT INTO athletes_new (
    id, competition_id, first_name, last_name, date_of_birth,
    gender, weight_class, division, age_category, lot_number,
    bodyweight, squat_rack_height, bench_rack_height, created_at
)
SELECT
    id, competition_id, first_name, last_name, date_of_birth,
    gender, weight_class, division, age_category, lot_number,
    bodyweight, squat_rack_height, bench_rack_height, created_at
FROM athletes;

-- Supprimer l'ancienne table
DROP TABLE athletes;

-- Renommer la nouvelle table
ALTER TABLE athletes_new RENAME TO athletes;

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_athletes_competition ON athletes(competition_id);

-- 2. Créer la table pour l'historique de performance des athlètes
-- Permet de suivre la progression au fil des compétitions

CREATE TABLE IF NOT EXISTS athlete_history (
    id TEXT PRIMARY KEY,
    athlete_id TEXT NOT NULL,
    competition_id TEXT NOT NULL,
    competition_name TEXT NOT NULL,
    competition_date TEXT NOT NULL,

    -- Résultats
    bodyweight REAL,
    weight_class TEXT NOT NULL,
    division TEXT NOT NULL,

    -- Tentatives et résultats
    best_squat REAL,
    best_bench REAL,
    best_deadlift REAL,
    total REAL,

    -- Scores
    ipf_points REAL,
    wilks_score REAL,
    dots_score REAL,
    mcculloch_coefficient REAL,  -- Pour les Masters

    -- Classements
    rank_category INTEGER,       -- Classement dans la catégorie
    rank_absolute INTEGER,       -- Classement absolu

    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_athlete_history_athlete ON athlete_history(athlete_id);
CREATE INDEX IF NOT EXISTS idx_athlete_history_competition ON athlete_history(competition_id);
CREATE INDEX IF NOT EXISTS idx_athlete_history_date ON athlete_history(competition_date);

-- 3. Créer une table pour les comparaisons de compétitions
-- Permet de comparer les performances globales entre compétitions

CREATE TABLE IF NOT EXISTS competition_comparisons (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,

    -- Statistiques globales
    total_athletes INTEGER,
    total_lifts INTEGER,
    successful_lifts INTEGER,
    failed_lifts INTEGER,

    -- Records de la compétition
    best_squat_male REAL,
    best_squat_female REAL,
    best_bench_male REAL,
    best_bench_female REAL,
    best_deadlift_male REAL,
    best_deadlift_female REAL,
    best_total_male REAL,
    best_total_female REAL,

    -- Moyennes
    avg_total_male REAL,
    avg_total_female REAL,
    avg_ipf_points REAL,

    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_competition_comparisons_competition ON competition_comparisons(competition_id);
