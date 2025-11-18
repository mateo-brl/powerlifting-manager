-- Migration pour ajouter le champ out_of_competition
-- Permet de marquer un athlète comme "hors match" si son poids dépasse sa catégorie
-- L'athlète peut quand même participer mais ne sera pas classé officiellement

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
    -- Champs média
    country TEXT,
    team_logo TEXT,
    athlete_photo TEXT,
    -- Nouveau champ: statut hors match
    out_of_competition INTEGER DEFAULT 0 CHECK(out_of_competition IN (0, 1)),  -- Boolean: 0 = non, 1 = oui
    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

-- Copier les données existantes
INSERT INTO athletes_new (
    id, competition_id, first_name, last_name, date_of_birth,
    gender, weight_class, division, age_category, lot_number,
    bodyweight, squat_rack_height, bench_rack_height,
    country, team_logo, athlete_photo, created_at
)
SELECT
    id, competition_id, first_name, last_name, date_of_birth,
    gender, weight_class, division, age_category, lot_number,
    bodyweight, squat_rack_height, bench_rack_height,
    country, team_logo, athlete_photo, created_at
FROM athletes;

-- Supprimer l'ancienne table
DROP TABLE athletes;

-- Renommer la nouvelle table
ALTER TABLE athletes_new RENAME TO athletes;

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_athletes_competition ON athletes(competition_id);
