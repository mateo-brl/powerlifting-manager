use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WeighIn {
    pub id: String,
    pub athlete_id: String,
    pub competition_id: String,
    pub bodyweight: f64,
    pub weighed_in_at: String,
    pub opening_squat: f64,
    pub opening_bench: f64,
    pub opening_deadlift: f64,
    pub squat_rack_height: Option<i32>,
    pub bench_rack_height: Option<i32>,
    pub flight: Option<String>,
    pub lot_number: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct CreateWeighInInput {
    pub athlete_id: String,
    pub competition_id: String,
    pub bodyweight: f64,
    pub opening_squat: f64,
    pub opening_bench: f64,
    pub opening_deadlift: f64,
    pub squat_rack_height: Option<i32>,
    pub bench_rack_height: Option<i32>,
}

pub struct WeighInState {
    pub weigh_ins: Mutex<Vec<WeighIn>>,
}

#[tauri::command]
pub async fn create_weigh_in(
    input: CreateWeighInInput,
    state: State<'_, WeighInState>,
) -> Result<WeighIn, String> {
    let weigh_in = WeighIn {
        id: Uuid::new_v4().to_string(),
        athlete_id: input.athlete_id,
        competition_id: input.competition_id,
        bodyweight: input.bodyweight,
        weighed_in_at: chrono::Utc::now().to_rfc3339(),
        opening_squat: input.opening_squat,
        opening_bench: input.opening_bench,
        opening_deadlift: input.opening_deadlift,
        squat_rack_height: input.squat_rack_height,
        bench_rack_height: input.bench_rack_height,
        flight: None,
        lot_number: None,
    };

    let mut weigh_ins = state.weigh_ins.lock().unwrap();
    weigh_ins.push(weigh_in.clone());

    Ok(weigh_in)
}

#[tauri::command]
pub async fn get_weigh_ins(
    competition_id: String,
    state: State<'_, WeighInState>,
) -> Result<Vec<WeighIn>, String> {
    let weigh_ins = state.weigh_ins.lock().unwrap();
    let filtered: Vec<WeighIn> = weigh_ins
        .iter()
        .filter(|w| w.competition_id == competition_id)
        .cloned()
        .collect();
    Ok(filtered)
}

#[tauri::command]
pub async fn delete_weigh_in(id: String, state: State<'_, WeighInState>) -> Result<(), String> {
    let mut weigh_ins = state.weigh_ins.lock().unwrap();
    weigh_ins.retain(|w| w.id != id);
    Ok(())
}
