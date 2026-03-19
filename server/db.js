import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = 'data/candidates.db';
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS marketing_candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    whatsapp TEXT,
    location TEXT,
    portfolio_url TEXT,
    tiktok_url TEXT,
    instagram_url TEXT,
    current_stage TEXT,
    device_score INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Submitted',
    candidate_payload TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS marketing_candidate_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL REFERENCES marketing_candidates(id) ON DELETE CASCADE,
    file_key TEXT NOT NULL,
    file_name TEXT,
    file_path TEXT,
    public_url TEXT,
    file_type TEXT,
    file_size INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS started_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    whatsapp TEXT,
    portfolio_url TEXT,
    tiktok_url TEXT,
    instagram_url TEXT,
    first_name TEXT,
    last_name TEXT,
    completed INTEGER DEFAULT 0,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS marketing_candidate_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL REFERENCES marketing_candidates(id) ON DELETE CASCADE,
    reviewer_name TEXT,
    score_creativity INTEGER,
    score_hook INTEGER,
    score_editing INTEGER,
    score_trend INTEGER,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;
