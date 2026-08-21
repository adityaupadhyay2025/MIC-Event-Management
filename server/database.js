const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "mic_events.db"));

db.pragma("journal_mode = WAL");

const columns = db.prepare("PRAGMA table_info(registrations)").all();

const addColumn = (name, definition) => {
    if (!columns.some(column => column.name === name)) {
        db.exec(`ALTER TABLE registrations ADD COLUMN ${name} ${definition}`);
    }
};

addColumn("category", "TEXT NOT NULL DEFAULT 'Other'");
addColumn("performance_title", "TEXT NOT NULL DEFAULT 'Open Mic Performance'");
addColumn("duration", "INTEGER NOT NULL DEFAULT 5");
addColumn("status", "TEXT NOT NULL DEFAULT 'waiting'");

module.exports = db;