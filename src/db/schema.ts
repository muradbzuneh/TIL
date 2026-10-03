export const DATABASE_VERSION = 2;

export const CREATE_TABLES_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tracked_apps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  package_name TEXT UNIQUE,
  app_name TEXT NOT NULL,
  icon_uri TEXT,
  source TEXT NOT NULL DEFAULT 'installed',
  daily_limit_seconds INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracked_app_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  system_usage_seconds INTEGER NOT NULL DEFAULT 0,
  manual_usage_seconds INTEGER NOT NULL DEFAULT 0,
  total_usage_seconds INTEGER NOT NULL DEFAULT 0,
  last_synced_at TEXT,
  
  FOREIGN KEY (tracked_app_id)
    REFERENCES tracked_apps(id)
    ON DELETE CASCADE,

  UNIQUE(tracked_app_id, date)
);

CREATE TABLE IF NOT EXISTS manual_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tracked_app_id INTEGER NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  date TEXT NOT NULL,

  FOREIGN KEY (tracked_app_id)
    REFERENCES tracked_apps(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS global_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  daily_limit_seconds INTEGER NOT NULL DEFAULT 0,
  is_enabled INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_usage_app_date
ON daily_usage(tracked_app_id, date);

CREATE INDEX IF NOT EXISTS idx_manual_sessions_app_date
ON manual_sessions(tracked_app_id, date);
`;