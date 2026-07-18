// ============================================================
// ONE-TIME MIGRATION: data/users.json  -->  data/streamophilia.db
// ============================================================
// Run once with: node migrate.js
// Safe to re-run — it skips users that already exist in the DB.
// ============================================================

const fs = require('fs');
const path = require('path');
const db = require('./db');

const JSON_PATH = path.join(__dirname, 'data', 'users.json');

function migrate() {
    if (!fs.existsSync(JSON_PATH)) {
        console.log('No users.json found — nothing to migrate.');
        return;
    }

    const raw = fs.readFileSync(JSON_PATH, 'utf-8');
    let oldUsers;
    try {
        oldUsers = JSON.parse(raw);
    } catch {
        console.log('users.json is empty or invalid — nothing to migrate.');
        return;
    }

    if (!Array.isArray(oldUsers) || oldUsers.length === 0) {
        console.log('users.json has no users — nothing to migrate.');
        return;
    }

    const insert = db.prepare(`
        INSERT OR IGNORE INTO users (username, email, password, created_at, last_login)
        VALUES (@username, @email, @password, @createdAt, @lastLogin)
    `);

    let migrated = 0;
    for (const u of oldUsers) {
        const result = insert.run({
            username: u.username,
            email: u.email,
            password: u.password, // already bcrypt-hashed, carried over as-is
            createdAt: u.createdAt || new Date().toISOString(),
            lastLogin: u.lastLogin || new Date().toISOString()
        });
        if (result.changes > 0) migrated++;
    }

    console.log(`Migration complete: ${migrated} of ${oldUsers.length} user(s) migrated into SQLite.`);
    console.log(`Old file kept at ${JSON_PATH} as a backup — safe to delete once you've verified everything works.`);
}

migrate();
