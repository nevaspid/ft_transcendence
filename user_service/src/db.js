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
    pending_two_factor_secret TEXT DEFAULT NULL,
    is_online INTEGER DEFAULT 0
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
addColumn('language', "TEXT DEFAULT 'fr'");
addColumn('is_online', 'INTEGER DEFAULT 0');

// Création table friendships pour gérer les amis
db.prepare(`
  CREATE TABLE IF NOT EXISTS friendships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    addressee_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, addressee_id),
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (addressee_id) REFERENCES users(id)
  )
`).run();

// Création des index uniques (optionnel)
try {
  db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)').run();
  db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)').run();
} catch (e) {
  console.error('Erreur lors de la création d’index uniques :', e);
}

// --- Fonctions utiles pour online/offline ---
export const setUserOnline = (userId) => {
  db.prepare("UPDATE users SET is_online = 1, last_active = ? WHERE id = ?")
    .run(Math.floor(Date.now() / 1000), userId);
};

export const setUserOffline = (userId) => {
  console.log("setUserOffline appelé avec :", userId);
  db.prepare("UPDATE users SET is_online = 0 WHERE id = ?")
    .run(userId);
    console.log("Nombre de lignes mises à jour :", result.changes);
};

export default db;