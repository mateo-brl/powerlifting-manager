use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
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

#[derive(Debug, Deserialize)]
pub struct UpdateAthleteInput {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub date_of_birth: Option<String>,
    pub gender: Option<String>,
    pub weight_class: Option<String>,
    pub division: Option<String>,
    pub age_category: Option<String>,
    pub lot_number: Option<i32>,
    pub bodyweight: Option<f64>,
    pub squat_rack_height: Option<i32>,
    pub bench_rack_height: Option<i32>,
}

pub struct AthleteState {
    pub athletes: Mutex<Vec<Athlete>>,
}

#[tauri::command]
pub async fn create_athlete(
    input: CreateAthleteInput,
    state: State<'_, AthleteState>,
) -> Result<Athlete, String> {
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

    let mut athletes = state.athletes.lock().unwrap();
    athletes.push(athlete.clone());

    Ok(athlete)
}

#[tauri::command]
pub async fn get_athletes(
    competition_id: String,
    state: State<'_, AthleteState>,
) -> Result<Vec<Athlete>, String> {
    let athletes = state.athletes.lock().unwrap();
    let filtered: Vec<Athlete> = athletes
        .iter()
        .filter(|a| a.competition_id == competition_id)
        .cloned()
        .collect();
    Ok(filtered)
}

#[tauri::command]
pub async fn update_athlete(
    id: String,
    input: UpdateAthleteInput,
    state: State<'_, AthleteState>,
) -> Result<Athlete, String> {
    let mut athletes = state.athletes.lock().unwrap();

    let athlete = athletes.iter_mut().find(|a| a.id == id);

    match athlete {
        Some(a) => {
            if let Some(first_name) = input.first_name {
                a.first_name = first_name;
            }
            if let Some(last_name) = input.last_name {
                a.last_name = last_name;
            }
            if let Some(date_of_birth) = input.date_of_birth {
                a.date_of_birth = date_of_birth;
            }
            if let Some(gender) = input.gender {
                a.gender = gender;
            }
            if let Some(weight_class) = input.weight_class {
                a.weight_class = weight_class;
            }
            if let Some(division) = input.division {
                a.division = division;
            }
            if let Some(age_category) = input.age_category {
                a.age_category = age_category;
            }
            if let Some(lot_number) = input.lot_number {
                a.lot_number = Some(lot_number);
            }
            if let Some(bodyweight) = input.bodyweight {
                a.bodyweight = Some(bodyweight);
            }
            if let Some(squat_rack_height) = input.squat_rack_height {
                a.squat_rack_height = Some(squat_rack_height);
            }
            if let Some(bench_rack_height) = input.bench_rack_height {
                a.bench_rack_height = Some(bench_rack_height);
            }
            Ok(a.clone())
        }
        None => Err("Athlete not found".to_string()),
    }
}

#[tauri::command]
pub async fn delete_athlete(id: String, state: State<'_, AthleteState>) -> Result<(), String> {
    let mut athletes = state.athletes.lock().unwrap();
    athletes.retain(|a| a.id != id);
    Ok(())
}
