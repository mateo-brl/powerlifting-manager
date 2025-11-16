use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum LiftType {
    Squat,
    Bench,
    Deadlift,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum AttemptResult {
    Success,
    Failure,
    Pending,
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

pub struct AttemptState {
    pub attempts: Mutex<Vec<Attempt>>,
}

#[tauri::command]
pub async fn create_attempt(
    input: CreateAttemptInput,
    state: State<'_, AttemptState>,
) -> Result<Attempt, String> {
    let attempt = Attempt {
        id: Uuid::new_v4().to_string(),
        athlete_id: input.athlete_id,
        competition_id: input.competition_id,
        lift_type: input.lift_type,
        attempt_number: input.attempt_number,
        weight_kg: input.weight_kg,
        result: AttemptResult::Pending,
        referee_votes: None,
        timestamp: Some(chrono::Utc::now().to_rfc3339()),
        rack_height: input.rack_height,
    };

    let mut attempts = state.attempts.lock().unwrap();
    attempts.push(attempt.clone());

    Ok(attempt)
}

#[tauri::command]
pub async fn update_attempt(
    input: UpdateAttemptInput,
    state: State<'_, AttemptState>,
) -> Result<Attempt, String> {
    let mut attempts = state.attempts.lock().unwrap();

    let attempt = attempts
        .iter_mut()
        .find(|a| a.id == input.id)
        .ok_or_else(|| "Attempt not found".to_string())?;

    if let Some(weight) = input.weight_kg {
        attempt.weight_kg = weight;
    }

    if let Some(result) = input.result {
        attempt.result = result;
        attempt.timestamp = Some(chrono::Utc::now().to_rfc3339());
    }

    if let Some(votes) = input.referee_votes {
        attempt.referee_votes = Some(votes);
        // Auto-calculate result based on votes (2 or 3 green = success)
        let green_count = votes.iter().filter(|&&v| v).count();
        attempt.result = if green_count >= 2 {
            AttemptResult::Success
        } else {
            AttemptResult::Failure
        };
    }

    if let Some(rack_height) = input.rack_height {
        attempt.rack_height = Some(rack_height);
    }

    Ok(attempt.clone())
}

#[tauri::command]
pub async fn get_attempts(
    competition_id: String,
    state: State<'_, AttemptState>,
) -> Result<Vec<Attempt>, String> {
    let attempts = state.attempts.lock().unwrap();
    let filtered: Vec<Attempt> = attempts
        .iter()
        .filter(|a| a.competition_id == competition_id)
        .cloned()
        .collect();
    Ok(filtered)
}

#[tauri::command]
pub async fn get_athlete_attempts(
    athlete_id: String,
    state: State<'_, AttemptState>,
) -> Result<Vec<Attempt>, String> {
    let attempts = state.attempts.lock().unwrap();
    let filtered: Vec<Attempt> = attempts
        .iter()
        .filter(|a| a.athlete_id == athlete_id)
        .cloned()
        .collect();
    Ok(filtered)
}

#[tauri::command]
pub async fn delete_attempt(id: String, state: State<'_, AttemptState>) -> Result<(), String> {
    let mut attempts = state.attempts.lock().unwrap();
    attempts.retain(|a| a.id != id);
    Ok(())
}
