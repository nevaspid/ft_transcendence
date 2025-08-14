import db from './db.js'; // Assure-toi que `db.js` exporte l'instance better-sqlite3

// 🔄 Créer une demande d'ami
export function createFriendRequest(from, to) {
  const checkStmt = db.prepare(`
    SELECT * FROM friendships
    WHERE (requester_id = ? AND addressee_id = ?)
       OR (requester_id = ? AND addressee_id = ?)
  `);
  const existing = checkStmt.get(from, to, to, from);

  if (existing) {
    if (existing.requester_id === from && existing.addressee_id === to) {
      // La même demande existe déjà
      throw new Error('Demande d\'ami déjà existante');
    } else {
      // Demande inverse existante => on accepte la demande inverse
      if (existing.status === 'pending') {
        const updateStmt = db.prepare(`
          UPDATE friendships SET status = 'accepted' WHERE id = ?
        `);
        updateStmt.run(existing.id);
        return { message: 'Demande d\'ami acceptée automatiquement' };
      } else {
        // Si elle est déjà acceptée, on peut aussi renvoyer un message
        throw new Error('Vous êtes déjà amis');
      }
    }
  }

  // Sinon, on crée la demande classique (pending)
  const insertStmt = db.prepare(`
    INSERT INTO friendships (requester_id, addressee_id, status)
    VALUES (?, ?, 'pending')
  `);
  return insertStmt.run(from, to);
}

// 👥 Récupérer la liste des amis acceptés d’un utilisateur
export function getFriendsOfUser(userId) {
  const stmt = db.prepare(`
    SELECT u.*
    FROM users u
    JOIN friendships f
      ON ((f.requester_id = u.id AND f.addressee_id = ?)
       OR (f.addressee_id = u.id AND f.requester_id = ?))
    WHERE f.status = 'accepted'
  `);
  return stmt.all(userId, userId);
}
