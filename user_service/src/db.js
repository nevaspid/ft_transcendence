import Database from 'better-sqlite3';

const db = new Database('./database.sqlite');

// Création de la table utilisateurs si elle n'existe pas
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT NOT NULL,
    avatar_url TEXT DEFAULT NULL
  )
`).run();

export default db;
