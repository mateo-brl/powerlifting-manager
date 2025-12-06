// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;
mod websocket;

use commands::competition::{create_competition, get_competitions, update_competition, delete_competition};
use commands::athlete::{create_athlete, get_athletes, update_athlete, delete_athlete};
use commands::weigh_in::{create_weigh_in, get_weigh_ins, delete_weigh_in};
use commands::attempt::{create_attempt, update_attempt, get_attempts, get_athlete_attempts, delete_attempt};
use commands::flight::{create_flight, get_flights, update_flight, delete_flight, delete_flights_by_competition};
use commands::protest::{create_protest, get_pending_protests, resolve_protest, get_protest_history};
use commands::equipment::{update_athlete_equipment, validate_equipment, get_non_validated_equipment, get_all_equipment};
use std::sync::Mutex;
use tokio::sync::broadcast;
use serde_json::Value;
use tauri::Manager;

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
        .setup(|app| {
            // Initialize database
            let db_path = database::get_db_path(app.handle());
            let pool = database::init_db(db_path)
                .expect("Failed to initialize database");

            app.manage(pool);

            Ok(())
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
            create_protest,
            get_pending_protests,
            resolve_protest,
            get_protest_history,
            update_athlete_equipment,
            validate_equipment,
            get_non_validated_equipment,
            get_all_equipment,
            broadcast_websocket_event,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
