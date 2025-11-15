use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Athlete {
    pub id: String,
    pub competition_id: String,
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: String,
    pub gender: String,
    pub weight_class: String,
    pub division: String,
    pub age_category: String,
    pub lot_number: Option<i32>,
    pub bodyweight: Option<f64>,
    pub squat_rack_height: Option<i32>,
    pub bench_rack_height: Option<i32>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateAthleteInput {
    pub competition_id: String,
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: String,
    pub gender: String,
    pub weight_class: String,
    pub division: String,
    pub age_category: String,
}

#[tauri::command]
pub async fn create_athlete(input: CreateAthleteInput) -> Result<Athlete, String> {
    let athlete = Athlete {
        id: Uuid::new_v4().to_string(),
        competition_id: input.competition_id,
        first_name: input.first_name,
        last_name: input.last_name,
        date_of_birth: input.date_of_birth,
        gender: input.gender,
        weight_class: input.weight_class,
        division: input.division,
        age_category: input.age_category,
        lot_number: None,
        bodyweight: None,
        squat_rack_height: None,
        bench_rack_height: None,
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    // TODO: Sauvegarder en DB

    Ok(athlete)
}

#[tauri::command]
pub async fn get_athletes(competition_id: String) -> Result<Vec<Athlete>, String> {
    // TODO: Récupérer depuis SQLite
    Ok(vec![])
}

#[tauri::command]
pub async fn update_athlete(id: String, data: serde_json::Value) -> Result<Athlete, String> {
    // TODO: Mettre à jour en DB
    Err("Not implemented yet".to_string())
}

#[tauri::command]
pub async fn delete_athlete(id: String) -> Result<(), String> {
    // TODO: Supprimer de la DB
    Ok(())
}
