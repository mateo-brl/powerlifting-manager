// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;

use commands::competition::{create_competition, get_competitions, update_competition, delete_competition};
use commands::athlete::{create_athlete, get_athletes, update_athlete, delete_athlete};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            create_competition,
            get_competitions,
            update_competition,
            delete_competition,
            create_athlete,
            get_athletes,
            update_athlete,
            delete_athlete,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
