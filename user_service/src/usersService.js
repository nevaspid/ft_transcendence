import db from './db.js';

// ➕ Créer un nouvel utilisateur
export function createUser(username, hashedPassword) {
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  stmt.run(username, hashedPassword);
}

// 🔍 Trouver un utilisateur par son nom
export function getUserByUsername(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

// 🔍 Trouver un utilisateur par son ID
export function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

// 🔄 Mettre à jour le mot de passe
export function updatePassword(userId, hashedPassword) {
  const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
  stmt.run(hashedPassword, userId);
}

// 📃 Obtenir tous les utilisateurs (sans les mots de passe)
export function getAllUsers() {
  const stmt = db.prepare('SELECT id, username FROM users');
  return stmt.all();
}

// Mettre à jour l'avatar utilisateur
export function updateUserAvatar(userId, avatarUrl) {
  const stmt = db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?');
  const result = stmt.run(avatarUrl, userId);
  if (result.changes === 0) {
    throw new Error('User not found');
  }
}