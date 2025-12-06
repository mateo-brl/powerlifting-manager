use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;
use crate::database::DbPool;
use rusqlite::params;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Competition {
    pub id: String,
    pub name: String,
    pub date: String,
    pub location: Option<String>,
    pub federation: String,
    pub status: String,
    pub format: String, // "full_power", "bench_only", "push_pull"
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateCompetitionInput {
    pub name: String,
    pub date: String,
    pub location: Option<String>,
    pub federation: String,
    pub format: Option<String>, // defaults to "full_power"
}

#[derive(Debug, Deserialize)]
pub struct UpdateCompetitionInput {
    pub name: Option<String>,
    pub date: Option<String>,
    pub location: Option<String>,
    pub federation: Option<String>,
    pub status: Option<String>,
    pub format: Option<String>,
}

#[tauri::command]
pub async fn create_competition(
    input: CreateCompetitionInput,
    pool: State<'_, DbPool>,
) -> Result<Competition, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let competition = Competition {
        id: Uuid::new_v4().to_string(),
        name: input.name,
        date: input.date,
        location: input.location,
        federation: input.federation,
        status: "upcoming".to_string(),
        format: input.format.unwrap_or_else(|| "full_power".to_string()),
        created_at: now.clone(),
        updated_at: now,
    };

    conn.execute(
        "INSERT INTO competitions (id, name, date, location, federation, status, format, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            &competition.id,
            &competition.name,
            &competition.date,
            &competition.location,
            &competition.federation,
            &competition.status,
            &competition.format,
            &competition.created_at,
            &competition.updated_at,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(competition)
}

#[tauri::command]
pub async fn get_competitions(pool: State<'_, DbPool>) -> Result<Vec<Competition>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, date, location, federation, status, format, created_at, updated_at FROM competitions ORDER BY date DESC")
        .map_err(|e| e.to_string())?;

    let competitions = stmt
        .query_map([], |row| {
            Ok(Competition {
                id: row.get(0)?,
                name: row.get(1)?,
                date: row.get(2)?,
                location: row.get(3)?,
                federation: row.get(4)?,
                status: row.get(5)?,
                format: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(competitions)
}

#[tauri::command]
pub async fn update_competition(
    id: String,
    input: UpdateCompetitionInput,
    pool: State<'_, DbPool>,
) -> Result<Competition, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    // Build dynamic UPDATE query
    let mut updates = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(name) = input.name {
        updates.push("name = ?");
        params.push(Box::new(name));
    }
    if let Some(date) = input.date {
        updates.push("date = ?");
        params.push(Box::new(date));
    }
    if let Some(location) = input.location {
        updates.push("location = ?");
        params.push(Box::new(location));
    }
    if let Some(federation) = input.federation {
        updates.push("federation = ?");
        params.push(Box::new(federation));
    }
    if let Some(status) = input.status {
        updates.push("status = ?");
        params.push(Box::new(status));
    }
    if let Some(format) = input.format {
        updates.push("format = ?");
        params.push(Box::new(format));
    }

    if updates.is_empty() {
        return Err("No fields to update".to_string());
    }

    updates.push("updated_at = ?");
    params.push(Box::new(now.clone()));
    params.push(Box::new(id.clone()));

    let sql = format!(
        "UPDATE competitions SET {} WHERE id = ?",
        updates.join(", ")
    );

    let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

    conn.execute(&sql, params_refs.as_slice())
        .map_err(|e| e.to_string())?;

    // Fetch updated competition
    let competition = conn
        .query_row(
            "SELECT id, name, date, location, federation, status, format, created_at, updated_at FROM competitions WHERE id = ?",
            [&id],
            |row| {
                Ok(Competition {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    date: row.get(2)?,
                    location: row.get(3)?,
                    federation: row.get(4)?,
                    status: row.get(5)?,
                    format: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(competition)
}

#[tauri::command]
pub async fn delete_competition(id: String, pool: State<'_, DbPool>) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM competitions WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
