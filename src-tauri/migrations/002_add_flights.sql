-- Migration pour ajouter la table flights
-- Permet de persister les groupes (flights) d'athlètes

CREATE TABLE IF NOT EXISTS flights (
    id TEXT PRIMARY KEY,
    competition_id TEXT NOT NULL,
    name TEXT NOT NULL,
    athlete_ids TEXT NOT NULL, -- JSON array: ["id1", "id2", ...]
    lift_type TEXT NOT NULL CHECK(lift_type IN ('squat', 'bench', 'deadlift')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'active', 'completed')),
    created_at TEXT NOT NULL,
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_flights_competition ON flights(competition_id);
CREATE INDEX IF NOT EXISTS idx_flights_lift_type ON flights(lift_type);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
