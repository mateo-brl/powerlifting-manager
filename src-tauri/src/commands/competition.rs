use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Competition {
    pub id: String,
    pub name: String,
    pub date: String,
    pub location: Option<String>,
    pub federation: String,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCompetitionInput {
    pub name: String,
    pub date: String,
    pub location: Option<String>,
    pub federation: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateCompetitionInput {
    pub name: Option<String>,
    pub date: Option<String>,
    pub location: Option<String>,
    pub federation: Option<String>,
    pub status: Option<String>,
}

pub struct CompetitionState {
    pub competitions: Mutex<Vec<Competition>>,
}

#[tauri::command]
pub async fn create_competition(
    input: CreateCompetitionInput,
    state: State<'_, CompetitionState>,
) -> Result<Competition, String> {
    let now = chrono::Utc::now().to_rfc3339();
    let competition = Competition {
        id: Uuid::new_v4().to_string(),
        name: input.name,
        date: input.date,
        location: input.location,
        federation: input.federation,
        status: "upcoming".to_string(),
        created_at: now.clone(),
        updated_at: now,
    };

    let mut competitions = state.competitions.lock().unwrap();
    competitions.push(competition.clone());

    Ok(competition)
}

#[tauri::command]
pub async fn get_competitions(state: State<'_, CompetitionState>) -> Result<Vec<Competition>, String> {
    let competitions = state.competitions.lock().unwrap();
    Ok(competitions.clone())
}

#[tauri::command]
pub async fn update_competition(
    id: String,
    input: UpdateCompetitionInput,
    state: State<'_, CompetitionState>,
) -> Result<Competition, String> {
    let now = chrono::Utc::now().to_rfc3339();
    let mut competitions = state.competitions.lock().unwrap();

    let comp = competitions.iter_mut().find(|c| c.id == id);

    match comp {
        Some(c) => {
            if let Some(name) = input.name {
                c.name = name;
            }
            if let Some(date) = input.date {
                c.date = date;
            }
            if let Some(location) = input.location {
                c.location = Some(location);
            }
            if let Some(federation) = input.federation {
                c.federation = federation;
            }
            if let Some(status) = input.status {
                c.status = status;
            }
            c.updated_at = now;
            Ok(c.clone())
        }
        None => Err("Competition not found".to_string()),
    }
}

#[tauri::command]
pub async fn delete_competition(id: String, state: State<'_, CompetitionState>) -> Result<(), String> {
    let mut competitions = state.competitions.lock().unwrap();
    competitions.retain(|c| c.id != id);
    Ok(())
}
