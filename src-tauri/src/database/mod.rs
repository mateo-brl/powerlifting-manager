use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::Connection;
use std::path::PathBuf;
use tauri::Manager;

pub type DbPool = Pool<SqliteConnectionManager>;

/// Initialize database with connection pool and run migrations
pub fn init_db(db_path: PathBuf) -> Result<DbPool, Box<dyn std::error::Error>> {
    // Create database directory if it doesn't exist
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    // Create connection manager and pool
    let manager = SqliteConnectionManager::file(&db_path);
    let pool = Pool::new(manager)?;

    // Run migrations
    let conn = pool.get()?;
    run_migrations(&conn)?;

    Ok(pool)
}

/// Run all database migrations
fn run_migrations(conn: &Connection) -> Result<(), Box<dyn std::error::Error>> {
    // Create migrations tracking table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS _migrations (
            version INTEGER PRIMARY KEY,
            description TEXT NOT NULL,
            applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        )",
        [],
    )?;

    // Check current version
    let current_version: i32 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM _migrations",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    println!("[Database] Current migration version: {}", current_version);

    // Migration 1: Initial schema
    if current_version < 1 {
        println!("[Database] Running migration 1: Initial schema");
        conn.execute_batch(include_str!("migrations/001_initial_schema.sql"))?;
        conn.execute(
            "INSERT INTO _migrations (version, description) VALUES (1, 'create_initial_tables')",
            [],
        )?;
    }

    // Migration 2: Protests table
    if current_version < 2 {
        println!("[Database] Running migration 2: Protests table");
        conn.execute_batch(include_str!("migrations/002_protests.sql"))?;
        conn.execute(
            "INSERT INTO _migrations (version, description) VALUES (2, 'create_protests_table')",
            [],
        )?;
    }

    // Migration 3: Equipment validation
    if current_version < 3 {
        println!("[Database] Running migration 3: Equipment validation");
        conn.execute_batch(include_str!("migrations/003_equipment_validation.sql"))?;
        conn.execute(
            "INSERT INTO _migrations (version, description) VALUES (3, 'add_equipment_validation')",
            [],
        )?;
    }

    println!("[Database] All migrations completed successfully");
    Ok(())
}

/// Get database path in app data directory
pub fn get_db_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");

    app_dir.join("powerlifting.db")
}
