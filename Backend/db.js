// ============================================================
// DATABASE SETUP (SQLite via Node's built-in node:sqlite)
// ============================================================
// This replaces the old JSON-file "database" with a real,
// file-based SQL database. We use Node's own built-in SQLite
// module (available since Node 22.5+, no flag needed since
// Node 22.13+) instead of an npm package like better-sqlite3.
// That means there is NO native binary to compile or download —
// it ships inside Node itself, so this works identically on
// Windows, Mac, and Linux with zero extra setup.
//
// Requires Node.js 22.5.0 or later. Run `node --version` to check.
// ============================================================

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'streamophilia.db');

// Make sure the data folder exists (fresh clones won't have it)
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_FILE);

// Better write performance + safe concurrent reads
db.exec('PRAGMA journal_mode = WAL;');

// --- Schema ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT NOT NULL UNIQUE,
    email         TEXT NOT NULL UNIQUE,
    password      TEXT NOT NULL,
    coins         INTEGER NOT NULL DEFAULT 500,
    status        TEXT NOT NULL DEFAULT 'active',
    created_at    TEXT NOT NULL,
    last_login    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    text          TEXT,
    image         TEXT,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tournaments (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    host_user_id      INTEGER NOT NULL REFERENCES users(id),
    name              TEXT NOT NULL,
    game              TEXT,
    start_date        TEXT,
    end_date          TEXT,
    min_members       INTEGER,
    max_members       INTEGER,
    prize_allocation  TEXT,
    host_investment   INTEGER NOT NULL,
    created_at        TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    type          TEXT NOT NULL,   -- 'signup_bonus' | 'tournament_host' | 'tournament_refund' | 'admin_credit' | 'admin_debit'
    amount        INTEGER NOT NULL, -- positive = added, negative = removed
    reason        TEXT,
    created_at    TEXT NOT NULL
  );
`);

// --- Migration guards for databases created before these columns existed ---
// (safe to run every startup: ALTER TABLE ADD COLUMN fails silently if it's already there)
try {
    db.exec('ALTER TABLE users ADD COLUMN coins INTEGER NOT NULL DEFAULT 500');
} catch (err) {
    if (!/duplicate column/i.test(err.message)) throw err;
}
try {
    db.exec("ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'");
} catch (err) {
    if (!/duplicate column/i.test(err.message)) throw err;
}

module.exports = db;
