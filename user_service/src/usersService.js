import db from './db.js';

export function createUser(username, hashedPassword, email, pseudo) {
  const stmt = db.prepare(
    'INSERT INTO users (username, password, email, pseudo) VALUES (?, ?, ?, ?)'
  );
  stmt.run(username, hashedPassword, email, pseudo);
}

export function createOAuthUser({ username, email = null, googleId, avatar_url = null }) {
  const existing = db.prepare(`
    SELECT * FROM users WHERE google_id = ? OR email = ?
  `).get(googleId, email);

  if (existing) {
    // Si google_id pas encore renseigné, on le met à jour
    if (!existing.google_id && googleId) {
      if (!existing.avatar_url && avatar_url) {
        // Mise à jour google_id + avatar_url (avatar manquant en DB)
        db.prepare(`
          UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?
        `).run(googleId, avatar_url, existing.id);
      } else {
        // Mise à jour google_id seulement, on garde l'avatar existant
        db.prepare(`
          UPDATE users SET google_id = ? WHERE id = ?
        `).run(googleId, existing.id);
      }
      return db.prepare(`SELECT * FROM users WHERE id = ?`).get(existing.id);
    }

    // Google_id existe déjà, on met à jour avatar_url uniquement s'il est vide en DB
    if (existing.google_id && !existing.avatar_url && avatar_url) {
      db.prepare(`
        UPDATE users SET avatar_url = ? WHERE id = ?
      `).run(avatar_url, existing.id);

      return db.prepare(`SELECT * FROM users WHERE id = ?`).get(existing.id);
    }

    // Sinon, on garde tout tel quel (avatar déjà existant)
    return existing;
  }

  // Nouvel utilisateur => création avec tous les champs
  const insert = db.prepare(`
    INSERT INTO users (username, email, google_id, avatar_url)
    VALUES (?, ?, ?, ?)
  `);

  const info = insert.run(username, email, googleId, avatar_url);

  return db.prepare(`
    SELECT * FROM users WHERE id = ?
  `).get(info.lastInsertRowid);
}




// 🔍 Trouver un utilisateur par son nom
export function getUserByUsername(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

// 🔍 Trouver un utilisateur par son email
export function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

// 🔍 Trouver un utilisateur par son ID
export function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

// 🔍 Trouver un utilisateur par son pseudo
export function getUserByPseudo(pseudo) {
  const stmt = db.prepare('SELECT * FROM users WHERE pseudo = ?');
  return stmt.get(pseudo);
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
  console.log('Mise à jour de l\'avatar pour l\'utilisateur', userId, '=>', avatarUrl);
  const stmt = db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?');
  const result = stmt.run(avatarUrl, userId);
  if (result.changes === 0) {
    throw new Error('User not found');
  }
}

// Met à jour la clé secrète 2FA et l'état d'activation
export function updateTwoFactor(userId, secret, enabled) {
  const stmt = db.prepare('UPDATE users SET two_factor_secret = ?, two_factor_enabled = ? WHERE id = ?');
  stmt.run(secret, enabled ? 1 : 0, userId);
}

// Récupérer les infos 2FA
export function getTwoFactorByUserId(userId) {
  const stmt = db.prepare('SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = ?');
  return stmt.get(userId);
}

// Fonction d'update
export function updateUserProfile(userId, pseudo, email) {
  const updates = [];
  const params = [];

  if (pseudo !== undefined) {
    updates.push('pseudo = ?');
    params.push(pseudo);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    params.push(email);
  }

  if (updates.length === 0) {
    // Rien à mettre à jour
    return;
  }

  params.push(userId);

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  const stmt = db.prepare(sql);
  stmt.run(...params);
}
