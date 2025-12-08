use crate::database::DbPool;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Athlete {
    pub id: String,
    pub competition_id: String,
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: String,
    pub gender: String,
    pub weight_class: String,
    pub division: String,
    pub age_category: String,
    pub lot_number: Option<i32>,
    pub bodyweight: Option<f64>,
    pub squat_rack_height: Option<i32>,
    pub bench_rack_height: Option<i32>,
    pub team: Option<String>,
    pub country: Option<String>,
    pub team_logo: Option<String>,
    pub athlete_photo: Option<String>,
    pub out_of_competition: Option<bool>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateAthleteInput {
    pub competition_id: String,
    pub first_name: String,
    pub last_name: String,
    pub date_of_birth: String,
    pub gender: String,
    pub weight_class: String,
    pub division: String,
    pub age_category: String,
    pub lot_number: Option<i32>,
    pub bodyweight: Option<f64>,
    pub squat_rack_height: Option<i32>,
    pub bench_rack_height: Option<i32>,
    pub team: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAthleteInput {
    pub first_name: Option<String>,
    pub last_name: Option<String>,
    pub date_of_birth: Option<String>,
    pub gender: Option<String>,
    pub weight_class: Option<String>,
    pub division: Option<String>,
    pub age_category: Option<String>,
    pub lot_number: Option<i32>,
    pub bodyweight: Option<f64>,
    pub squat_rack_height: Option<i32>,
    pub bench_rack_height: Option<i32>,
}

#[tauri::command]
pub async fn create_athlete(
    input: CreateAthleteInput,
    pool: State<'_, DbPool>,
) -> Result<Athlete, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let athlete = Athlete {
        id: Uuid::new_v4().to_string(),
        competition_id: input.competition_id,
        first_name: input.first_name,
        last_name: input.last_name,
        date_of_birth: input.date_of_birth,
        gender: input.gender,
        weight_class: input.weight_class,
        division: input.division,
        age_category: input.age_category,
        lot_number: input.lot_number,
        bodyweight: input.bodyweight,
        squat_rack_height: input.squat_rack_height,
        bench_rack_height: input.bench_rack_height,
        team: input.team,
        country: Some("FRA".to_string()),
        team_logo: None,
        athlete_photo: None,
        out_of_competition: Some(false),
        created_at: now.clone(),
    };

    conn.execute(
        "INSERT INTO athletes (id, competition_id, first_name, last_name, date_of_birth, gender, weight_class, division, age_category, lot_number, bodyweight, squat_rack_height, bench_rack_height, team, country, out_of_competition, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
        params![
            &athlete.id,
            &athlete.competition_id,
            &athlete.first_name,
            &athlete.last_name,
            &athlete.date_of_birth,
            &athlete.gender,
            &athlete.weight_class,
            &athlete.division,
            &athlete.age_category,
            &athlete.lot_number,
            &athlete.bodyweight,
            &athlete.squat_rack_height,
            &athlete.bench_rack_height,
            &athlete.team,
            &athlete.country,
            &athlete.out_of_competition.unwrap_or(false),
            &athlete.created_at,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(athlete)
}

#[tauri::command]
pub async fn get_athletes(
    competition_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<Athlete>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, competition_id, first_name, last_name, date_of_birth, gender, weight_class, division, age_category, lot_number, bodyweight, squat_rack_height, bench_rack_height, team, country, team_logo, athlete_photo, out_of_competition, created_at
             FROM athletes
             WHERE competition_id = ?
             ORDER BY last_name, first_name"
        )
        .map_err(|e| e.to_string())?;

    let athletes = stmt
        .query_map([&competition_id], |row| {
            Ok(Athlete {
                id: row.get(0)?,
                competition_id: row.get(1)?,
                first_name: row.get(2)?,
                last_name: row.get(3)?,
                date_of_birth: row.get(4)?,
                gender: row.get(5)?,
                weight_class: row.get(6)?,
                division: row.get(7)?,
                age_category: row.get(8)?,
                lot_number: row.get(9)?,
                bodyweight: row.get(10)?,
                squat_rack_height: row.get(11)?,
                bench_rack_height: row.get(12)?,
                team: row.get(13)?,
                country: row.get(14)?,
                team_logo: row.get(15)?,
                athlete_photo: row.get(16)?,
                out_of_competition: row.get::<_, Option<i32>>(17)?.map(|v| v != 0),
                created_at: row.get(18)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(athletes)
}

#[tauri::command]
pub async fn update_athlete(
    id: String,
    input: UpdateAthleteInput,
    pool: State<'_, DbPool>,
) -> Result<Athlete, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut updates = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(first_name) = input.first_name {
        updates.push("first_name = ?");
        params.push(Box::new(first_name));
    }
    if let Some(last_name) = input.last_name {
        updates.push("last_name = ?");
        params.push(Box::new(last_name));
    }
    if let Some(date_of_birth) = input.date_of_birth {
        updates.push("date_of_birth = ?");
        params.push(Box::new(date_of_birth));
    }
    if let Some(gender) = input.gender {
        updates.push("gender = ?");
        params.push(Box::new(gender));
    }
    if let Some(weight_class) = input.weight_class {
        updates.push("weight_class = ?");
        params.push(Box::new(weight_class));
    }
    if let Some(division) = input.division {
        updates.push("division = ?");
        params.push(Box::new(division));
    }
    if let Some(age_category) = input.age_category {
        updates.push("age_category = ?");
        params.push(Box::new(age_category));
    }
    if let Some(lot_number) = input.lot_number {
        updates.push("lot_number = ?");
        params.push(Box::new(lot_number));
    }
    if let Some(bodyweight) = input.bodyweight {
        updates.push("bodyweight = ?");
        params.push(Box::new(bodyweight));
    }
    if let Some(squat_rack_height) = input.squat_rack_height {
        updates.push("squat_rack_height = ?");
        params.push(Box::new(squat_rack_height));
    }
    if let Some(bench_rack_height) = input.bench_rack_height {
        updates.push("bench_rack_height = ?");
        params.push(Box::new(bench_rack_height));
    }

    if updates.is_empty() {
        return Err("No fields to update".to_string());
    }

    params.push(Box::new(id.clone()));

    let sql = format!("UPDATE athletes SET {} WHERE id = ?", updates.join(", "));
    let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

    conn.execute(&sql, params_refs.as_slice())
        .map_err(|e| e.to_string())?;

    let athlete = conn
        .query_row(
            "SELECT id, competition_id, first_name, last_name, date_of_birth, gender, weight_class, division, age_category, lot_number, bodyweight, squat_rack_height, bench_rack_height, team, country, team_logo, athlete_photo, out_of_competition, created_at FROM athletes WHERE id = ?",
            [&id],
            |row| {
                Ok(Athlete {
                    id: row.get(0)?,
                    competition_id: row.get(1)?,
                    first_name: row.get(2)?,
                    last_name: row.get(3)?,
                    date_of_birth: row.get(4)?,
                    gender: row.get(5)?,
                    weight_class: row.get(6)?,
                    division: row.get(7)?,
                    age_category: row.get(8)?,
                    lot_number: row.get(9)?,
                    bodyweight: row.get(10)?,
                    squat_rack_height: row.get(11)?,
                    bench_rack_height: row.get(12)?,
                    team: row.get(13)?,
                    country: row.get(14)?,
                    team_logo: row.get(15)?,
                    athlete_photo: row.get(16)?,
                    out_of_competition: row.get::<_, Option<i32>>(17)?.map(|v| v != 0),
                    created_at: row.get(18)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(athlete)
}

#[tauri::command]
pub async fn delete_athlete(id: String, pool: State<'_, DbPool>) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM athletes WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
