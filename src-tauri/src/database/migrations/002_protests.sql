-- Migration 002: Protests table
-- Implements IPF/FFForce compliant protest management system

CREATE TABLE IF NOT EXISTS protests (
    id TEXT PRIMARY KEY NOT NULL,
    competition_id TEXT NOT NULL,
    athlete_id TEXT NOT NULL,
    attempt_id TEXT NOT NULL,
    protest_type TEXT NOT NULL, -- 'referee_decision', 'equipment', 'procedure'
    reason TEXT NOT NULL,
    timestamp INTEGER NOT NULL, -- Unix timestamp when protest was filed
    protest_deadline INTEGER NOT NULL, -- Unix timestamp (timestamp + 60 seconds)
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    jury_decision TEXT, -- 'accepted' or 'rejected'
    jury_notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
    FOREIGN KEY (athlete_id) REFERENCES athletes(id) ON DELETE CASCADE,
    FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_protests_competition ON protests(competition_id);
CREATE INDEX IF NOT EXISTS idx_protests_athlete ON protests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_protests_attempt ON protests(attempt_id);
CREATE INDEX IF NOT EXISTS idx_protests_status ON protests(status);
CREATE INDEX IF NOT EXISTS idx_protests_timestamp ON protests(timestamp);
