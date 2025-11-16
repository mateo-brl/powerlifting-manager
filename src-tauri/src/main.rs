// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;

use commands::competition::{create_competition, get_competitions, update_competition, delete_competition, CompetitionState};
use commands::athlete::{create_athlete, get_athletes, update_athlete, delete_athlete, AthleteState};
use std::sync::Mutex;

fn main() {
    tauri::Builder::default()
        .manage(CompetitionState {
            competitions: Mutex::new(Vec::new()),
        })
        .manage(AthleteState {
            athletes: Mutex::new(Vec::new()),
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
