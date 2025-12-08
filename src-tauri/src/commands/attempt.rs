use crate::database::DbPool;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum LiftType {
    Squat,
    Bench,
    Deadlift,
}

impl LiftType {
    fn to_str(&self) -> &str {
        match self {
            LiftType::Squat => "squat",
            LiftType::Bench => "bench",
            LiftType::Deadlift => "deadlift",
        }
    }

    fn from_str(s: &str) -> Result<Self, String> {
        match s {
            "squat" => Ok(LiftType::Squat),
            "bench" => Ok(LiftType::Bench),
            "deadlift" => Ok(LiftType::Deadlift),
            _ => Err(format!("Invalid lift type: {}", s)),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum AttemptResult {
    Success,
    Failure,
    Pending,
}

impl AttemptResult {
    fn to_str(&self) -> &str {
        match self {
            AttemptResult::Success => "success",
            AttemptResult::Failure => "failure",
            AttemptResult::Pending => "pending",
        }
    }

    fn from_str(s: &str) -> Result<Self, String> {
        match s {
            "success" => Ok(AttemptResult::Success),
            "failure" => Ok(AttemptResult::Failure),
            "pending" => Ok(AttemptResult::Pending),
            _ => Err(format!("Invalid result: {}", s)),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Attempt {
    pub id: String,
    pub athlete_id: String,
    pub competition_id: String,
    pub lift_type: LiftType,
    pub attempt_number: i32, // 1, 2, or 3
    pub weight_kg: f64,
    pub result: AttemptResult,
    pub referee_votes: Option<[bool; 3]>,
    pub timestamp: Option<String>,
    pub rack_height: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAttemptInput {
    pub athlete_id: String,
    pub competition_id: String,
    pub lift_type: LiftType,
    pub attempt_number: i32,
    pub weight_kg: f64,
    pub rack_height: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAttemptInput {
    pub id: String,
    pub weight_kg: Option<f64>,
    pub result: Option<AttemptResult>,
    pub referee_votes: Option<[bool; 3]>,
    pub rack_height: Option<i32>,
}

#[tauri::command]
pub async fn create_attempt(
    input: CreateAttemptInput,
    pool: State<'_, DbPool>,
) -> Result<Attempt, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let attempt = Attempt {
        id: Uuid::new_v4().to_string(),
        athlete_id: input.athlete_id,
        competition_id: input.competition_id,
        lift_type: input.lift_type.clone(),
        attempt_number: input.attempt_number,
        weight_kg: input.weight_kg,
        result: AttemptResult::Pending,
        referee_votes: None,
        timestamp: Some(now.clone()),
        rack_height: input.rack_height,
    };

    conn.execute(
        "INSERT INTO attempts (id, athlete_id, competition_id, lift_type, attempt_number, weight_kg, result, timestamp, rack_height)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            &attempt.id,
            &attempt.athlete_id,
            &attempt.competition_id,
            input.lift_type.to_str(),
            &attempt.attempt_number,
            &attempt.weight_kg,
            attempt.result.to_str(),
            &now,
            &attempt.rack_height,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(attempt)
}

#[tauri::command]
pub async fn update_attempt(
    input: UpdateAttemptInput,
    pool: State<'_, DbPool>,
) -> Result<Attempt, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut updates = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(weight_kg) = input.weight_kg {
        updates.push("weight_kg = ?");
        params.push(Box::new(weight_kg));
    }

    if let Some(rack_height) = input.rack_height {
        updates.push("rack_height = ?");
        params.push(Box::new(rack_height));
    }

    if let Some(votes) = input.referee_votes {
        let votes_json = serde_json::to_string(&votes).map_err(|e| e.to_string())?;
        updates.push("referee_votes = ?");
        params.push(Box::new(votes_json));

        // Auto-calculate result based on votes (2 or 3 green = success)
        let green_count = votes.iter().filter(|&&v| v).count();
        let result = if green_count >= 2 {
            AttemptResult::Success
        } else {
            AttemptResult::Failure
        };

        updates.push("result = ?");
        params.push(Box::new(result.to_str().to_string()));
        updates.push("timestamp = ?");
        params.push(Box::new(now.clone()));
    } else if let Some(result) = input.result {
        updates.push("result = ?");
        params.push(Box::new(result.to_str().to_string()));
        updates.push("timestamp = ?");
        params.push(Box::new(now.clone()));
    }

    if updates.is_empty() {
        return Err("No fields to update".to_string());
    }

    params.push(Box::new(input.id.clone()));

    let sql = format!("UPDATE attempts SET {} WHERE id = ?", updates.join(", "));
    let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

    conn.execute(&sql, params_refs.as_slice())
        .map_err(|e| e.to_string())?;

    // Fetch updated attempt
    let attempt = conn
        .query_row(
            "SELECT id, athlete_id, competition_id, lift_type, attempt_number, weight_kg, result, referee_votes, timestamp, rack_height FROM attempts WHERE id = ?",
            [&input.id],
            |row| {
                let votes_str: Option<String> = row.get(7)?;
                let votes = votes_str.and_then(|s| serde_json::from_str(&s).ok());

                Ok(Attempt {
                    id: row.get(0)?,
                    athlete_id: row.get(1)?,
                    competition_id: row.get(2)?,
                    lift_type: LiftType::from_str(&row.get::<_, String>(3)?).unwrap_or(LiftType::Squat),
                    attempt_number: row.get(4)?,
                    weight_kg: row.get(5)?,
                    result: AttemptResult::from_str(&row.get::<_, String>(6)?).unwrap_or(AttemptResult::Pending),
                    referee_votes: votes,
                    timestamp: row.get(8)?,
                    rack_height: row.get(9)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(attempt)
}

#[tauri::command]
pub async fn get_attempts(
    competition_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<Attempt>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, athlete_id, competition_id, lift_type, attempt_number, weight_kg, result, referee_votes, timestamp, rack_height
             FROM attempts
             WHERE competition_id = ?
             ORDER BY timestamp"
        )
        .map_err(|e| e.to_string())?;

    let attempts = stmt
        .query_map([&competition_id], |row| {
            let votes_str: Option<String> = row.get(7)?;
            let votes = votes_str.and_then(|s| serde_json::from_str(&s).ok());

            Ok(Attempt {
                id: row.get(0)?,
                athlete_id: row.get(1)?,
                competition_id: row.get(2)?,
                lift_type: LiftType::from_str(&row.get::<_, String>(3)?).unwrap_or(LiftType::Squat),
                attempt_number: row.get(4)?,
                weight_kg: row.get(5)?,
                result: AttemptResult::from_str(&row.get::<_, String>(6)?)
                    .unwrap_or(AttemptResult::Pending),
                referee_votes: votes,
                timestamp: row.get(8)?,
                rack_height: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(attempts)
}

#[tauri::command]
pub async fn get_athlete_attempts(
    athlete_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<Attempt>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, athlete_id, competition_id, lift_type, attempt_number, weight_kg, result, referee_votes, timestamp, rack_height
             FROM attempts
             WHERE athlete_id = ?
             ORDER BY lift_type, attempt_number"
        )
        .map_err(|e| e.to_string())?;

    let attempts = stmt
        .query_map([&athlete_id], |row| {
            let votes_str: Option<String> = row.get(7)?;
            let votes = votes_str.and_then(|s| serde_json::from_str(&s).ok());

            Ok(Attempt {
                id: row.get(0)?,
                athlete_id: row.get(1)?,
                competition_id: row.get(2)?,
                lift_type: LiftType::from_str(&row.get::<_, String>(3)?).unwrap_or(LiftType::Squat),
                attempt_number: row.get(4)?,
                weight_kg: row.get(5)?,
                result: AttemptResult::from_str(&row.get::<_, String>(6)?)
                    .unwrap_or(AttemptResult::Pending),
                referee_votes: votes,
                timestamp: row.get(8)?,
                rack_height: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(attempts)
}

#[tauri::command]
pub async fn delete_attempt(id: String, pool: State<'_, DbPool>) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM attempts WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
