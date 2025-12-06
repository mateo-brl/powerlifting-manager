use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;
use crate::database::DbPool;
use rusqlite::params;

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

#[tauri::command]
pub async fn create_flight(
    input: CreateFlightInput,
    pool: State<'_, DbPool>,
) -> Result<Flight, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let flight = Flight {
        id: Uuid::new_v4().to_string(),
        competition_id: input.competition_id,
        name: input.name,
        athlete_ids: input.athlete_ids.clone(),
        lift_type: input.lift_type,
        status: input.status,
        created_at: now.clone(),
    };

    let athlete_ids_json = serde_json::to_string(&input.athlete_ids).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO flights (id, competition_id, name, athlete_ids, lift_type, status, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            &flight.id,
            &flight.competition_id,
            &flight.name,
            &athlete_ids_json,
            &flight.lift_type,
            &flight.status,
            &now,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(flight)
}

#[tauri::command]
pub async fn get_flights(
    competition_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<Flight>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, competition_id, name, athlete_ids, lift_type, status, created_at
             FROM flights
             WHERE competition_id = ?
             ORDER BY created_at"
        )
        .map_err(|e| e.to_string())?;

    let flights = stmt
        .query_map([&competition_id], |row| {
            let athlete_ids_str: String = row.get(3)?;
            let athlete_ids: Vec<String> = serde_json::from_str(&athlete_ids_str).unwrap_or_default();

            Ok(Flight {
                id: row.get(0)?,
                competition_id: row.get(1)?,
                name: row.get(2)?,
                athlete_ids,
                lift_type: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(flights)
}

#[tauri::command]
pub async fn update_flight(
    input: UpdateFlightInput,
    pool: State<'_, DbPool>,
) -> Result<Flight, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut updates = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(name) = input.name {
        updates.push("name = ?");
        params.push(Box::new(name));
    }
    if let Some(athlete_ids) = input.athlete_ids {
        let athlete_ids_json = serde_json::to_string(&athlete_ids).map_err(|e| e.to_string())?;
        updates.push("athlete_ids = ?");
        params.push(Box::new(athlete_ids_json));
    }
    if let Some(status) = input.status {
        updates.push("status = ?");
        params.push(Box::new(status));
    }

    if updates.is_empty() {
        return Err("No fields to update".to_string());
    }

    params.push(Box::new(input.id.clone()));

    let sql = format!("UPDATE flights SET {} WHERE id = ?", updates.join(", "));
    let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

    conn.execute(&sql, params_refs.as_slice())
        .map_err(|e| e.to_string())?;

    // Fetch updated flight
    let flight = conn
        .query_row(
            "SELECT id, competition_id, name, athlete_ids, lift_type, status, created_at FROM flights WHERE id = ?",
            [&input.id],
            |row| {
                let athlete_ids_str: String = row.get(3)?;
                let athlete_ids: Vec<String> = serde_json::from_str(&athlete_ids_str).unwrap_or_default();

                Ok(Flight {
                    id: row.get(0)?,
                    competition_id: row.get(1)?,
                    name: row.get(2)?,
                    athlete_ids,
                    lift_type: row.get(4)?,
                    status: row.get(5)?,
                    created_at: row.get(6)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(flight)
}

#[tauri::command]
pub async fn delete_flight(
    id: String,
    pool: State<'_, DbPool>,
) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM flights WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_flights_by_competition(
    competition_id: String,
    pool: State<'_, DbPool>,
) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM flights WHERE competition_id = ?", [&competition_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
