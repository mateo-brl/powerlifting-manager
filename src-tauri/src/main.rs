// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod websocket;

use commands::competition::{create_competition, get_competitions, update_competition, delete_competition, CompetitionState};
use commands::athlete::{create_athlete, get_athletes, update_athlete, delete_athlete, AthleteState};
use commands::weigh_in::{create_weigh_in, get_weigh_ins, delete_weigh_in, WeighInState};
use commands::attempt::{create_attempt, update_attempt, get_attempts, get_athlete_attempts, delete_attempt, AttemptState};
use commands::flight::{create_flight, get_flights, update_flight, delete_flight, delete_flights_by_competition, FlightState};
use std::sync::Mutex;
use tokio::sync::broadcast;
use serde_json::Value;

// WebSocket broadcast state
pub struct WebSocketState {
    pub sender: Mutex<Option<broadcast::Sender<String>>>,
}

#[tauri::command]
async fn broadcast_websocket_event(
    event: Value,
    state: tauri::State<'_, WebSocketState>,
) -> Result<(), String> {
    let sender = state.sender.lock().unwrap();
    if let Some(tx) = sender.as_ref() {
        websocket::broadcast_event(tx, event);
        Ok(())
    } else {
        Err("WebSocket not initialized".to_string())
    }
}

#[tokio::main]
async fn main() {
    // Create WebSocket broadcast channel
    let (tx, _rx) = broadcast::channel::<String>(100);
    let tx_clone = tx.clone();

    // Start WebSocket server in background
    tokio::spawn(async move {
        if let Err(e) = websocket::start_websocket_server(tx_clone).await {
            eprintln!("[WebSocket Server] Error: {}", e);
        }
    });

    tauri::Builder::default()
        .manage(CompetitionState {
            competitions: Mutex::new(Vec::new()),
        })
        .manage(AthleteState {
            athletes: Mutex::new(Vec::new()),
        })
        .manage(WeighInState {
            weigh_ins: Mutex::new(Vec::new()),
        })
        .manage(AttemptState {
            attempts: Mutex::new(Vec::new()),
        })
        .manage(FlightState {
            flights: Mutex::new(Vec::new()),
        })
        .manage(WebSocketState {
            sender: Mutex::new(Some(tx)),
        })
        .invoke_handler(tauri::generate_handler![
            create_competition,
            get_competitions,
            update_competition,
            delete_competition,
            create_athlete,
            get_athletes,
            update_athlete,
            delete_athlete,
            create_weigh_in,
            get_weigh_ins,
            delete_weigh_in,
            create_attempt,
            update_attempt,
            get_attempts,
            get_athlete_attempts,
            delete_attempt,
            create_flight,
            get_flights,
            update_flight,
            delete_flight,
            delete_flights_by_competition,
            broadcast_websocket_event,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
