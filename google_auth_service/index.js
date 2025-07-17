import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fetch from 'node-fetch';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const PORT = process.env.PORT || 4003;
const USER_SERVICE_URL = 'http://user_service:3000';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function main() {
  const fastify = Fastify({ logger: true });

  // Active le CORS pour accepter les requêtes de plusieurs origines
  await fastify.register(cors, {
    origin: [
      'https://localhost:8443',
      'https://localhost:3000',
      'https://localhost:3001',
      'https://localhost:4000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000',
      'http://localhost:8443',
    ],
    methods: ['POST', 'GET'],
  });

  // === Route POST /auth/google ===
  // Reçoit un token Google, le valide, et renvoie un JWT personnalisé

  fastify.post(
    '/auth/google',
    {
      schema: {
        body: {
          type: 'object',
          required: ['token'],
          properties: {
            token: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { token } = request.body;
        fastify.log.info('Token reçu: ' + token);

        if (!token) {
          return reply.status(400).send({ message: 'Token manquant' });
        }

        // === Vérifie la validité du token Google ===
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.name || !payload.sub) {
          return reply.status(400).send({
            message: 'Token invalide ou informations manquantes (email, name ou sub)',
          });
        }

        // Données extraites du token Google
        const email = payload.email;
        const name = payload.name;
        const picture = payload.picture || null;
        const googleId = payload.sub;

        // === Appel au microservice utilisateur ===
        // Crée ou récupère un utilisateur via son Google ID
        const userResponse = await fetch(`${USER_SERVICE_URL}/users/google-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            username: name,
            googleId,
            avatarUrl: picture,
          }),
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
          fastify.log.error('Erreur du service utilisateur: ' + JSON.stringify(userData));
          return reply.status(userResponse.status).send({
            message: userData.message || 'Erreur service utilisateur',
          });
        }

        // === Prépare les données pour le JWT ===
        const jwtPayload = {
          userId: userData.id,
          username: userData.username,
          email: userData.email,
        };

        // Ajout du pseudo au token si présent
        if (userData.pseudo) {
          jwtPayload.pseudo = userData.pseudo;
        }

        // === Génère un token JWT pour le client ===
        const jwtToken = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: '1h' });

        // === Répond avec le token et les données utilisateur ===
        return reply.send({
          token: jwtToken,
          user: userData,
        });
      } catch (err) {
        fastify.log.error('Erreur interne serveur Google Auth:', err);
        console.error('Stack:', err.stack);
        return reply.status(500).send({ message: 'Erreur interne serveur Google Auth' });
      }
    }
  );

  // === Démarre le serveur Fastify ===

  try {
    await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });
    console.log(`Google Auth service running at http://0.0.0.0:${PORT}`);
  } catch (err) {
    console.error('Erreur démarrage Google Auth service:', err);
    process.exit(1);
  }
}

// Exécute le service

main();