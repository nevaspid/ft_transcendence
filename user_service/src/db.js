import Database from 'better-sqlite3';

const db = new Database('./database.sqlite', { verbose: console.log });

// Création initiale complète de la table si elle n'existe pas
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    pseudo TEXT,
    password TEXT DEFAULT NULL,
    avatar_url TEXT DEFAULT NULL,
    two_factor_secret TEXT DEFAULT '',
    two_factor_enabled INTEGER DEFAULT 0,
    google_id TEXT,
    email TEXT,
    pending_two_factor_secret TEXT DEFAULT NULL
  )
`).run();

// Ajout des colonnes si elles n'existent pas (silencieusement)
const addColumn = (name, typeAndDefault) => {
  try {
    db.prepare(`ALTER TABLE users ADD COLUMN ${name} ${typeAndDefault}`).run();
  } catch (e) {
    if (!e.message.includes('duplicate column name')) throw e;
  }
};

addColumn('pseudo', 'TEXT');
addColumn('two_factor_secret', 'TEXT DEFAULT NULL');
addColumn('two_factor_enabled', 'INTEGER DEFAULT 0');
addColumn('google_id', 'TEXT');
addColumn('email', 'TEXT');
addColumn('pending_two_factor_secret', 'TEXT DEFAULT NULL');

// Création des index uniques (optionnel)
try {
  db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)').run();
  db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)').run();
} catch (e) {
  console.error('Erreur lors de la création d’index uniques :', e);
}

export default db;