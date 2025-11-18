-- Migration pour ajouter les nouvelles divisions et catégories
-- Ajoute: Wraps, Single-Ply, Multi-Ply
-- Note: SQLite ne supporte pas ALTER COLUMN avec CHECK, donc on recrée la table

-- Créer une nouvelle table temporaire avec les nouvelles contraintes
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
    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

-- Copier les données existantes
INSERT INTO athletes_new
SELECT * FROM athletes;

-- Supprimer l'ancienne table
DROP TABLE athletes;

-- Renommer la nouvelle table
ALTER TABLE athletes_new RENAME TO athletes;

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_athletes_competition ON athletes(competition_id);
