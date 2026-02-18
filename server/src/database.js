const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("nexora.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      score REAL DEFAULT 5,
      total_ratings INTEGER DEFAULT 0,
      is_flagged INTEGER DEFAULT 0
    )
  `);
});

module.exports = db;
