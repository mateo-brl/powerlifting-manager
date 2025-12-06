use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;
use crate::database::DbPool;
use rusqlite::params;

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
    pub bench_safety_height: Option<i32>,
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
    pub bench_safety_height: Option<i32>,
}

#[tauri::command]
pub async fn create_weigh_in(
    input: CreateWeighInInput,
    pool: State<'_, DbPool>,
) -> Result<WeighIn, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let weigh_in = WeighIn {
        id: Uuid::new_v4().to_string(),
        athlete_id: input.athlete_id,
        competition_id: input.competition_id,
        bodyweight: input.bodyweight,
        weighed_in_at: now.clone(),
        opening_squat: input.opening_squat,
        opening_bench: input.opening_bench,
        opening_deadlift: input.opening_deadlift,
        squat_rack_height: input.squat_rack_height,
        bench_rack_height: input.bench_rack_height,
        bench_safety_height: input.bench_safety_height,
        flight: None,
        lot_number: None,
    };

    conn.execute(
        "INSERT INTO weigh_ins (id, athlete_id, competition_id, bodyweight, weighed_in_at, opening_squat, opening_bench, opening_deadlift, squat_rack_height, bench_rack_height, bench_safety_height, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            &weigh_in.id,
            &weigh_in.athlete_id,
            &weigh_in.competition_id,
            &weigh_in.bodyweight,
            &now,
            &weigh_in.opening_squat,
            &weigh_in.opening_bench,
            &weigh_in.opening_deadlift,
            &weigh_in.squat_rack_height,
            &weigh_in.bench_rack_height,
            &weigh_in.bench_safety_height,
            &now,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(weigh_in)
}

#[tauri::command]
pub async fn get_weigh_ins(
    competition_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<WeighIn>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, athlete_id, competition_id, bodyweight, weighed_in_at, opening_squat, opening_bench, opening_deadlift, squat_rack_height, bench_rack_height, bench_safety_height, flight, lot_number
             FROM weigh_ins
             WHERE competition_id = ?
             ORDER BY weighed_in_at"
        )
        .map_err(|e| e.to_string())?;

    let weigh_ins = stmt
        .query_map([&competition_id], |row| {
            Ok(WeighIn {
                id: row.get(0)?,
                athlete_id: row.get(1)?,
                competition_id: row.get(2)?,
                bodyweight: row.get(3)?,
                weighed_in_at: row.get(4)?,
                opening_squat: row.get(5)?,
                opening_bench: row.get(6)?,
                opening_deadlift: row.get(7)?,
                squat_rack_height: row.get(8)?,
                bench_rack_height: row.get(9)?,
                bench_safety_height: row.get(10)?,
                flight: row.get(11)?,
                lot_number: row.get(12)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(weigh_ins)
}

#[tauri::command]
pub async fn delete_weigh_in(id: String, pool: State<'_, DbPool>) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM weigh_ins WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
