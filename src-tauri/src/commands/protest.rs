use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;
use crate::database::DbPool;
use rusqlite::params;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Protest {
    pub id: String,
    pub competition_id: String,
    pub athlete_id: String,
    pub attempt_id: String,
    pub protest_type: String, // 'referee_decision' | 'equipment' | 'procedure'
    pub reason: String,
    pub timestamp: i64, // Unix timestamp when protest was filed
    pub protest_deadline: i64, // Unix timestamp (timestamp + 60 seconds)
    pub status: String, // 'pending' | 'accepted' | 'rejected'
    pub jury_decision: Option<String>,
    pub jury_notes: Option<String>,
    pub created_at: i64,
}

#[derive(Debug, Deserialize)]
pub struct CreateProtestInput {
    pub competition_id: String,
    pub athlete_id: String,
    pub attempt_id: String,
    pub protest_type: String,
    pub reason: String,
}

#[derive(Debug, Deserialize)]
pub struct ResolveProtestInput {
    pub protest_id: String,
    pub decision: String, // 'accepted' | 'rejected'
    pub jury_notes: String,
}

/// Create a new protest (must be within 60 seconds of attempt)
#[tauri::command]
pub async fn create_protest(
    input: CreateProtestInput,
    pool: State<'_, DbPool>,
) -> Result<Protest, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp();

    // Validate protest type
    if !["referee_decision", "equipment", "procedure"].contains(&input.protest_type.as_str()) {
        return Err("Invalid protest type".to_string());
    }

    // Validate reason length (minimum 20 characters)
    if input.reason.trim().len() < 20 {
        return Err("Protest reason must be at least 20 characters".to_string());
    }

    let protest = Protest {
        id: Uuid::new_v4().to_string(),
        competition_id: input.competition_id,
        athlete_id: input.athlete_id,
        attempt_id: input.attempt_id,
        protest_type: input.protest_type,
        reason: input.reason,
        timestamp: now,
        protest_deadline: now + 60, // 60 seconds deadline
        status: "pending".to_string(),
        jury_decision: None,
        jury_notes: None,
        created_at: now,
    };

    conn.execute(
        "INSERT INTO protests (id, competition_id, athlete_id, attempt_id, protest_type, reason, timestamp, protest_deadline, status, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            &protest.id,
            &protest.competition_id,
            &protest.athlete_id,
            &protest.attempt_id,
            &protest.protest_type,
            &protest.reason,
            &protest.timestamp,
            &protest.protest_deadline,
            &protest.status,
            &protest.created_at,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(protest)
}

/// Get all pending protests for a competition
#[tauri::command]
pub async fn get_pending_protests(
    competition_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<Protest>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, competition_id, athlete_id, attempt_id, protest_type, reason, timestamp, protest_deadline, status, jury_decision, jury_notes, created_at
             FROM protests
             WHERE competition_id = ? AND status = 'pending'
             ORDER BY timestamp DESC"
        )
        .map_err(|e| e.to_string())?;

    let protests = stmt
        .query_map([&competition_id], |row| {
            Ok(Protest {
                id: row.get(0)?,
                competition_id: row.get(1)?,
                athlete_id: row.get(2)?,
                attempt_id: row.get(3)?,
                protest_type: row.get(4)?,
                reason: row.get(5)?,
                timestamp: row.get(6)?,
                protest_deadline: row.get(7)?,
                status: row.get(8)?,
                jury_decision: row.get(9)?,
                jury_notes: row.get(10)?,
                created_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(protests)
}

/// Resolve a protest (accept or reject)
#[tauri::command]
pub async fn resolve_protest(
    input: ResolveProtestInput,
    pool: State<'_, DbPool>,
) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    // Validate decision
    if !["accepted", "rejected"].contains(&input.decision.as_str()) {
        return Err("Invalid decision. Must be 'accepted' or 'rejected'".to_string());
    }

    conn.execute(
        "UPDATE protests SET status = ?, jury_decision = ?, jury_notes = ? WHERE id = ?",
        params![&input.decision, &input.decision, &input.jury_notes, &input.protest_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Get complete protest history for a competition
#[tauri::command]
pub async fn get_protest_history(
    competition_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<Protest>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, competition_id, athlete_id, attempt_id, protest_type, reason, timestamp, protest_deadline, status, jury_decision, jury_notes, created_at
             FROM protests
             WHERE competition_id = ?
             ORDER BY timestamp DESC"
        )
        .map_err(|e| e.to_string())?;

    let protests = stmt
        .query_map([&competition_id], |row| {
            Ok(Protest {
                id: row.get(0)?,
                competition_id: row.get(1)?,
                athlete_id: row.get(2)?,
                attempt_id: row.get(3)?,
                protest_type: row.get(4)?,
                reason: row.get(5)?,
                timestamp: row.get(6)?,
                protest_deadline: row.get(7)?,
                status: row.get(8)?,
                jury_decision: row.get(9)?,
                jury_notes: row.get(10)?,
                created_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(protests)
}
