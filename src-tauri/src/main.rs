// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod database;

use commands::competition::{create_competition, get_competitions, update_competition, delete_competition, CompetitionState};
use commands::athlete::{create_athlete, get_athletes, update_athlete, delete_athlete, AthleteState};
use commands::weigh_in::{create_weigh_in, get_weigh_ins, delete_weigh_in, WeighInState};
use commands::attempt::{create_attempt, update_attempt, get_attempts, get_athlete_attempts, delete_attempt, AttemptState};
use std::sync::Mutex;

fn main() {
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
