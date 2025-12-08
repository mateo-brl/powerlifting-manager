use crate::database::DbPool;
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AthleteEquipment {
    pub weigh_in_id: String,
    pub athlete_id: String,
    pub athlete_name: String,
    pub equipment_singlet: Option<String>,
    pub equipment_singlet_brand: Option<String>,
    pub equipment_belt: Option<String>,
    pub equipment_belt_brand: Option<String>,
    pub equipment_knee_sleeves: Option<String>,
    pub equipment_knee_sleeves_brand: Option<String>,
    pub equipment_wrist_wraps: Option<String>,
    pub equipment_wrist_wraps_brand: Option<String>,
    pub equipment_shoes: Option<String>,
    pub equipment_shoes_brand: Option<String>,
    pub equipment_validated: bool,
    pub equipment_validator_name: Option<String>,
    pub equipment_validation_timestamp: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateEquipmentInput {
    pub weigh_in_id: String,
    pub equipment_singlet: Option<String>,
    pub equipment_singlet_brand: Option<String>,
    pub equipment_belt: Option<String>,
    pub equipment_belt_brand: Option<String>,
    pub equipment_knee_sleeves: Option<String>,
    pub equipment_knee_sleeves_brand: Option<String>,
    pub equipment_wrist_wraps: Option<String>,
    pub equipment_wrist_wraps_brand: Option<String>,
    pub equipment_shoes: Option<String>,
    pub equipment_shoes_brand: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ValidateEquipmentInput {
    pub weigh_in_id: String,
    pub validator_name: String,
}

/// Update athlete equipment information
#[tauri::command]
pub async fn update_athlete_equipment(
    input: UpdateEquipmentInput,
    pool: State<'_, DbPool>,
) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE weigh_ins SET
            equipment_singlet = ?1,
            equipment_singlet_brand = ?2,
            equipment_belt = ?3,
            equipment_belt_brand = ?4,
            equipment_knee_sleeves = ?5,
            equipment_knee_sleeves_brand = ?6,
            equipment_wrist_wraps = ?7,
            equipment_wrist_wraps_brand = ?8,
            equipment_shoes = ?9,
            equipment_shoes_brand = ?10,
            equipment_validated = 0
         WHERE id = ?11",
        params![
            &input.equipment_singlet,
            &input.equipment_singlet_brand,
            &input.equipment_belt,
            &input.equipment_belt_brand,
            &input.equipment_knee_sleeves,
            &input.equipment_knee_sleeves_brand,
            &input.equipment_wrist_wraps,
            &input.equipment_wrist_wraps_brand,
            &input.equipment_shoes,
            &input.equipment_shoes_brand,
            &input.weigh_in_id,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Mark equipment as validated
#[tauri::command]
pub async fn validate_equipment(
    input: ValidateEquipmentInput,
    pool: State<'_, DbPool>,
) -> Result<(), String> {
    let conn = pool.get().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().timestamp();

    conn.execute(
        "UPDATE weigh_ins SET
            equipment_validated = 1,
            equipment_validator_name = ?1,
            equipment_validation_timestamp = ?2
         WHERE id = ?3",
        params![&input.validator_name, &now, &input.weigh_in_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Get all non-validated equipment for a competition
#[tauri::command]
pub async fn get_non_validated_equipment(
    competition_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<AthleteEquipment>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT
                w.id,
                w.athlete_id,
                a.first_name || ' ' || a.last_name as athlete_name,
                w.equipment_singlet,
                w.equipment_singlet_brand,
                w.equipment_belt,
                w.equipment_belt_brand,
                w.equipment_knee_sleeves,
                w.equipment_knee_sleeves_brand,
                w.equipment_wrist_wraps,
                w.equipment_wrist_wraps_brand,
                w.equipment_shoes,
                w.equipment_shoes_brand,
                w.equipment_validated,
                w.equipment_validator_name,
                w.equipment_validation_timestamp
             FROM weigh_ins w
             JOIN athletes a ON w.athlete_id = a.id
             WHERE w.competition_id = ? AND (w.equipment_validated IS NULL OR w.equipment_validated = 0)
             ORDER BY a.last_name, a.first_name"
        )
        .map_err(|e| e.to_string())?;

    let equipment_list = stmt
        .query_map([&competition_id], |row| {
            Ok(AthleteEquipment {
                weigh_in_id: row.get(0)?,
                athlete_id: row.get(1)?,
                athlete_name: row.get(2)?,
                equipment_singlet: row.get(3)?,
                equipment_singlet_brand: row.get(4)?,
                equipment_belt: row.get(5)?,
                equipment_belt_brand: row.get(6)?,
                equipment_knee_sleeves: row.get(7)?,
                equipment_knee_sleeves_brand: row.get(8)?,
                equipment_wrist_wraps: row.get(9)?,
                equipment_wrist_wraps_brand: row.get(10)?,
                equipment_shoes: row.get(11)?,
                equipment_shoes_brand: row.get(12)?,
                equipment_validated: row
                    .get::<_, Option<i32>>(13)?
                    .map(|v| v != 0)
                    .unwrap_or(false),
                equipment_validator_name: row.get(14)?,
                equipment_validation_timestamp: row.get(15)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(equipment_list)
}

/// Get all equipment (validated and non-validated) for a competition
#[tauri::command]
pub async fn get_all_equipment(
    competition_id: String,
    pool: State<'_, DbPool>,
) -> Result<Vec<AthleteEquipment>, String> {
    let conn = pool.get().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT
                w.id,
                w.athlete_id,
                a.first_name || ' ' || a.last_name as athlete_name,
                w.equipment_singlet,
                w.equipment_singlet_brand,
                w.equipment_belt,
                w.equipment_belt_brand,
                w.equipment_knee_sleeves,
                w.equipment_knee_sleeves_brand,
                w.equipment_wrist_wraps,
                w.equipment_wrist_wraps_brand,
                w.equipment_shoes,
                w.equipment_shoes_brand,
                w.equipment_validated,
                w.equipment_validator_name,
                w.equipment_validation_timestamp
             FROM weigh_ins w
             JOIN athletes a ON w.athlete_id = a.id
             WHERE w.competition_id = ?
             ORDER BY a.last_name, a.first_name",
        )
        .map_err(|e| e.to_string())?;

    let equipment_list = stmt
        .query_map([&competition_id], |row| {
            Ok(AthleteEquipment {
                weigh_in_id: row.get(0)?,
                athlete_id: row.get(1)?,
                athlete_name: row.get(2)?,
                equipment_singlet: row.get(3)?,
                equipment_singlet_brand: row.get(4)?,
                equipment_belt: row.get(5)?,
                equipment_belt_brand: row.get(6)?,
                equipment_knee_sleeves: row.get(7)?,
                equipment_knee_sleeves_brand: row.get(8)?,
                equipment_wrist_wraps: row.get(9)?,
                equipment_wrist_wraps_brand: row.get(10)?,
                equipment_shoes: row.get(11)?,
                equipment_shoes_brand: row.get(12)?,
                equipment_validated: row
                    .get::<_, Option<i32>>(13)?
                    .map(|v| v != 0)
                    .unwrap_or(false),
                equipment_validator_name: row.get(14)?,
                equipment_validation_timestamp: row.get(15)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(equipment_list)
}
