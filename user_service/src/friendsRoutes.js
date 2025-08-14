import { getFriendsOfUser, createFriendRequest } from './friendsService.js';
import { getAllUsers } from './usersService.js';
import db from './db.js';

export default async function (fastify, opts) {

  // 👉 Liste de tous les utilisateurs (pour la sélection)
  fastify.get('/all-users', async (request, reply) => {
    try {
      const users = getAllUsers();
      reply.send(users);
    } catch (err) {
      reply.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' });
    }
  });

  // 👉 Récupérer les demandes d'amitié reçues en attente
  fastify.get('/requests/:userId', async (request, reply) => {
    const userId = parseInt(request.params.userId, 10);
    if (isNaN(userId)) {
      return reply.status(400).send({ error: 'ID utilisateur invalide' });
    }
    try {
      const stmt = db.prepare(`
        SELECT f.id, u.id as requesterId, u.username, u.avatar_url as avatarUrl
        FROM friendships f
        JOIN users u ON f.requester_id = u.id
        WHERE f.addressee_id = ? AND f.status = 'pending'
      `);
      const requests = stmt.all(userId);
      reply.send(requests);
    } catch (err) {
      console.error('Erreur récupération demandes:', err);
      reply.status(500).send({ error: 'Erreur lors de la récupération des demandes' });
    }
  });

  // 👉 Accepter ou refuser une demande
  fastify.put('/requests/:requestId', async (request, reply) => {
    const requestId = parseInt(request.params.requestId, 10);
    if (isNaN(requestId)) {
      return reply.status(400).send({ error: 'ID de demande invalide' });
    }

    const { status } = request.body; // 'accepted' ou 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return reply.status(400).send({ error: 'Statut invalide' });
    }

    try {
      const stmt = db.prepare(`
        UPDATE friendships SET status = ? WHERE id = ?
      `);
      stmt.run(status, requestId);
      reply.send({ success: true });
    } catch (err) {
      reply.status(500).send({ error: 'Erreur lors de la mise à jour de la demande' });
    }
  });

  // 👉 Envoyer une demande d'ami
  fastify.post('/', async (request, reply) => {
    const { from, to } = request.body;
    if (!from || !to) return reply.status(400).send({ error: 'Champs manquants' });

    try {
      const result = createFriendRequest(from, to);
      reply.send(result);
    } catch (err) {
      if (err.message === 'Demande d\'ami déjà existante' || err.message === 'Vous êtes déjà amis') {
        return reply.status(400).send({ error: err.message });
      }
      reply.status(500).send({ error: 'Erreur lors de l\'envoi de la demande' });
    }
  });

  // 👉 Supprimer un ami
  fastify.delete('/remove/:friendId', async (request, reply) => {
    const friendId = parseInt(request.params.friendId, 10);
    const userId = parseInt(request.query.userId, 10);

    if (isNaN(friendId) || isNaN(userId)) {
      return reply.status(400).send({ error: 'ID invalide ou utilisateur manquant' });
    }

    try {
      const stmt = db.prepare(`
        DELETE FROM friendships
      WHERE 
        status = 'accepted' AND (
          (requester_id = ? AND addressee_id = ?) OR 
          (requester_id = ? AND addressee_id = ?)
        )
      `);
      stmt.run(userId, friendId, friendId, userId);

      reply.send({ success: true, message: 'Ami supprimé' });
    } catch (err) {
      console.error('Erreur suppression ami:', err);
      reply.status(500).send({ error: 'Erreur lors de la suppression' });
    }
  });

  // 👉 Récupérer les amis d'un utilisateur
  fastify.get('/:id', (request, reply) => {
    const userId = request.params.id;
    try {
      const friends = getFriendsOfUser(userId);
      reply.send(friends);
    } catch (err) {
      reply.status(500).send({ error: 'Erreur lors de la récupération des amis' });
    }
  });
}
