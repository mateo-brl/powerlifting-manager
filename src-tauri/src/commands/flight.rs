use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Flight {
    pub id: String,
    pub competition_id: String,
    pub name: String,
    pub athlete_ids: Vec<String>,
    pub lift_type: String,
    pub status: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateFlightInput {
    pub competition_id: String,
    pub name: String,
    pub athlete_ids: Vec<String>,
    pub lift_type: String,
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateFlightInput {
    pub id: String,
    pub name: Option<String>,
    pub athlete_ids: Option<Vec<String>>,
    pub status: Option<String>,
}

pub struct FlightState {
    pub flights: Mutex<Vec<Flight>>,
}

#[tauri::command]
pub async fn create_flight(
    input: CreateFlightInput,
    state: State<'_, FlightState>,
) -> Result<Flight, String> {
    let flight = Flight {
        id: Uuid::new_v4().to_string(),
        competition_id: input.competition_id,
        name: input.name,
        athlete_ids: input.athlete_ids,
        lift_type: input.lift_type,
        status: input.status,
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    let mut flights = state.flights.lock().unwrap();
    flights.push(flight.clone());

    Ok(flight)
}

#[tauri::command]
pub async fn get_flights(
    competition_id: String,
    state: State<'_, FlightState>,
) -> Result<Vec<Flight>, String> {
    let flights = state.flights.lock().unwrap();
    let filtered: Vec<Flight> = flights
        .iter()
        .filter(|f| f.competition_id == competition_id)
        .cloned()
        .collect();
    Ok(filtered)
}

#[tauri::command]
pub async fn update_flight(
    input: UpdateFlightInput,
    state: State<'_, FlightState>,
) -> Result<Flight, String> {
    let mut flights = state.flights.lock().unwrap();

    let flight = flights
        .iter_mut()
        .find(|f| f.id == input.id)
        .ok_or_else(|| "Flight not found".to_string())?;

    if let Some(name) = input.name {
        flight.name = name;
    }
    if let Some(athlete_ids) = input.athlete_ids {
        flight.athlete_ids = athlete_ids;
    }
    if let Some(status) = input.status {
        flight.status = status;
    }

    Ok(flight.clone())
}

#[tauri::command]
pub async fn delete_flight(
    id: String,
    state: State<'_, FlightState>,
) -> Result<(), String> {
    let mut flights = state.flights.lock().unwrap();
    flights.retain(|f| f.id != id);
    Ok(())
}

#[tauri::command]
pub async fn delete_flights_by_competition(
    competition_id: String,
    state: State<'_, FlightState>,
) -> Result<(), String> {
    let mut flights = state.flights.lock().unwrap();
    flights.retain(|f| f.competition_id != competition_id);
    Ok(())
}
