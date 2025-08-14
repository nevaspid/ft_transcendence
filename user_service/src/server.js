import Fastify from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import axios from 'axios';
// import db from './db.js';
import db, { setUserOnline, setUserOffline, isUserOnline } from './db.js';
import {
  createUser,
  getUserByUsername,
  updatePassword,
  updateUserAvatar,
  createOAuthUser,
  updateUserProfile
} from './usersService.js';

import { parse } from 'url';

import profileRoutes from './profileRoutes.js';
import friendsRoutes from './friendsRoutes.js';

dotenv.config();
const host = process.env.SERVER_HOST;
const fastify = Fastify({ logger: true });

const users = new Map();

fastify.decorate('db', db);

fastify.register(cors, {
  origin: [
      `https://${host}:8443`,
      `http://${host}:3000`,
      `http://${host}:3001`,
      `http://${host}:4000`,
      `http://${host}:3000`,
      `http://${host}:3001`,
      `http://${host}:4000`,
      `http://${host}:8443`,
    ],
  // origin: true,
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'PUT', 'DELETE'],
  credentials: true,
});

fastify.register(fastifyCookie);

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
});

// PUT /users/:username/twofa_secret
fastify.put('/users/:username/twofa_secret', (request, reply) => {
  const username = request.params.username;
  const { secret } = request.body;
  if (!secret) return reply.status(400).send({ message: "Secret is required" });

  try {
    const info = db.prepare("UPDATE users SET two_factor_secret = ? WHERE username = ?")
                   .run(secret, username);
    if (info.changes === 0) {
      return reply.status(404).send({ message: "User not found" });
    }
    reply.send({ success: true });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ message: "Database error" });
  }
});

// POST /users
fastify.post("/users", (request, reply) => {
  const { username } = request.body;
  if (!username) return reply.status(400).send({ message: "Username is required" });

  try {
    const existingUser = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (existingUser) {
      return reply.send({ message: "User already exists" });
    }
    const info = db.prepare("INSERT INTO users (username) VALUES (?)").run(username);
    reply.send({ message: "User created", id: info.lastInsertRowid });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ message: "Database error" });
  }
});

// PUT /users/:username/pending_twofa_secret
fastify.put("/users/:username/pending_twofa_secret", (request, reply) => {
  const { username } = request.params;
  const { secret } = request.body;
  if (!secret) return reply.status(400).send({ message: "Secret is required" });

  try {
    const info = db.prepare("UPDATE users SET pending_two_factor_secret = ? WHERE username = ?")
                   .run(secret, username);
    if (info.changes === 0) {
      return reply.status(404).send({ message: "User not found" });
    }
    reply.send({ message: "Pending secret updated" });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ message: "Database error" });
  }
});

// PUT /users/:username/activate_twofa
fastify.put("/users/:username/activate_twofa", (request, reply) => {
  const { username } = request.params;
  const { secret } = request.body;
  if (!secret) return reply.status(400).send({ message: "Secret is required" });

  try {
    const info = db.prepare(
      "UPDATE users SET two_factor_secret = ?, pending_two_factor_secret = NULL WHERE username = ?"
    ).run(secret, username);

    if (info.changes === 0) {
      return reply.status(404).send({ message: "User not found" });
    }
    reply.send({ message: "2FA activated" });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ message: "Database error" });
  }
});

// GET /users/:username
fastify.get("/users/:username", (request, reply) => {
  const { username } = request.params;

  try {
    const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!row) {
      return reply.status(404).send({ message: "User not found" });
    }
    reply.send(row);
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ message: "Database error" });
  }
});

// -------------------------------
// ONLINE/OFFLINE MANAGEMENT
// -------------------------------
const usersOnline = new Map(); // username => { lastActive }

fastify.decorate('markOnline', async (userId) => {
  try {
    await setUserOnline(userId); // ici c'est l'id
    usersOnline.set(userId, { lastActive: Date.now() });
    fastify.log.info(`User ${userId} is online`);
  } catch (err) {
    fastify.log.error(`Error marking ${userId} online: ${err}`);
  }
});


fastify.decorate('markOffline', async (userId) => {
  try {
    await setUserOffline(userId); // fonction DB que tu dois avoir
    usersOnline.delete(userId);
    fastify.log.info(`User ${userId} is offline`);
  } catch (err) {
    fastify.log.error(`Error marking ${userId} offline: ${err}`);
  }
});

// Mise à jour lastActive sur chaque requête authentifiée
fastify.addHook('preHandler', async (request, reply) => {
  if (request.headers.authorization) {
    try {
      const token = request.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (usersOnline.has(decoded.username)) {
        usersOnline.get(decoded.username).lastActive = Date.now();
      }
    } catch (_) {}
  }
});

// Déconnexion automatique après 5 min d'inactivité
setInterval(() => {
  const now = Date.now();
  for (const [username, info] of usersOnline) {
    if (now - info.lastActive > 5 * 60 * 1000) { // 5 min
      setUserOffline(username);
      usersOnline.delete(username);
      fastify.log.info(`User ${username} set offline due to inactivity`);
    }
  }
}, 60 * 1000);

fastify.get('/user/:id/status', (request, reply) => {
  const { id } = request.params;

  try {
    const row = db.prepare('SELECT is_online FROM users WHERE id = ?').get(id);

    if (!row) {
      return reply.status(404).send({ error: 'Utilisateur non trouvé' });
    }

    return reply.send({ is_online: !!row.is_online });
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: 'Erreur serveur' });
  }
});


/* -------------------------------
  ✅ Décorateur JWT auth
--------------------------------- */
fastify.decorate('authenticate', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) throw new Error('No token provided');
    const token = authHeader.split(' ')[1];
    const decoded = await request.jwtVerify();
    request.user = decoded;
  } catch (err) {
    console.error('Authentication error:', err);
    return reply.code(401).send({ message: 'Unauthorized' });
  }
});

/* -------------------------------
  ✅ Vérifier si 2FA est activé
--------------------------------- */
fastify.post('/check-2fa', async (request, reply) => {
  const { username } = request.body;
  if (!username) return reply.code(400).send({ message: "Nom d'utilisateur requis" });

  const user = getUserByUsername(username);
  if (!user) return reply.code(404).send({ message: 'Utilisateur non trouvé' });

  reply.send({
    success: true,
    twoFactorEnabled: !!user.two_factor_enabled,
  });
});

/* -------------------------------
  ✅ Activer / Désactiver 2FA
--------------------------------- */
fastify.post('/enable-2fa', async (request, reply) => {
  const { username } = request.body;
  if (!username) return reply.code(400).send({ message: "Nom d'utilisateur requis" });

  // Récupérer le secret en attente
  const user = db.prepare(`SELECT pending_two_factor_secret FROM users WHERE username = ?`).get(username);
  if (!user) return reply.code(404).send({ message: 'Utilisateur non trouvé' });
  if (!user.pending_two_factor_secret) return reply.code(400).send({ message: 'Pas de secret en attente' });

  // Transférer le secret de pending_two_factor_secret vers two_factor_secret et activer la 2FA
  const result = db.prepare(`
    UPDATE users
    SET two_factor_secret = pending_two_factor_secret,
        pending_two_factor_secret = NULL,
        two_factor_enabled = 1
    WHERE username = ?
  `).run(username);

  if (result.changes === 0) return reply.code(500).send({ message: 'Erreur lors de la mise à jour' });

  reply.send({ success: true, message: '2FA activée' });
});

fastify.post('/disable-2fa', async (request, reply) => {
  const { username } = request.body;
  if (!username) return reply.code(400).send({ message: "Nom d'utilisateur requis" });

  const result = db.prepare(`UPDATE users SET two_factor_enabled = 0, two_factor_secret = NULL WHERE username = ?`).run(username);
  if (result.changes === 0) return reply.code(404).send({ message: 'Utilisateur non trouvé' });

  reply.send({ success: true, message: '2FA désactivée' });
});

/* -------------------------------
  ✅ Inscription
--------------------------------- */
fastify.post('/signup', async (request, reply) => {
  const { username, password, email, pseudo } = request.body;

  if (!username || username.length < 3)
    return reply.code(400).send({ message: 'Username too short' });
  if (!password || password.length < 6)
    return reply.code(400).send({ message: 'Password too short' });
  if (!email || typeof email !== 'string')
    return reply.code(400).send({ message: 'Email is required' });
  if (!pseudo || pseudo.length < 3)
    return reply.code(400).send({ message: 'Pseudo too short' });

  if (getUserByUsername(username))
    return reply.code(400).send({ message: 'Username already taken' });

  const hashedPassword = await bcrypt.hash(password, 10);
  createUser(username, hashedPassword, email, pseudo);
  reply.send({ success: true, message: 'User registered' });
});

/* -------------------------------
  ✅ LOGIN 2FA EN 2 ÉTAPES
--------------------------------- */

/**
 * Étape 1 : Vérifier username + password
 * - Si pas de 2FA => JWT direct
 * - Si 2FA activé => renvoyer "2FA required"
 */

fastify.post('/auth/login', async (request, reply) => {
  const { username, password } = request.body;

  const user = getUserByUsername(username);
  if (!user) return reply.code(401).send({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return reply.code(401).send({ message: 'Invalid credentials' });

  if (user.two_factor_enabled) {
    await fastify.markOnline(user.id);
    // Étape 2 nécessaire côté client, on renvoie aussi le pseudo
    return reply.send({ success: true, twofaRequired: true, pseudo: user.pseudo });
  } else {
    await fastify.markOnline(user.id);
    // JWT direct + on renvoie aussi le pseudo
    const token = jwt.sign({ id: user.id, username: user.username,  pseudo: user.pseudo }, process.env.JWT_SECRET, { expiresIn: '1h' });
     return reply.send({ success: true, token, pseudo: user.pseudo, language: user.language || 'fr' });
  }
});


/**
 * Étape 2 : Vérifier le token 2FA et délivrer le JWT
 */
fastify.post('/auth/verify-2fa', async (request, reply) => {
  const { username, twoFactorToken } = request.body;

  const user = getUserByUsername(username);
  if (!user || !user.two_factor_enabled) return reply.code(400).send({ message: 'Invalid request' });

  if (!twoFactorToken) return reply.code(400).send({ message: '2FA token required' });

  try {
    console.log("2FA secret envoyé :", user.two_factor_secret);
     const res = await axios.post(`${process.env.TWOFA_SERVICE_URL}/twofa/verify2`, {
      token: twoFactorToken,
      secret: user.two_factor_secret,
    });

    if (!res.data.verified) return reply.code(401).send({ message: 'Invalid 2FA token' });

    await fastify.markOnline(user.id);
    const token = jwt.sign({ id: user.id, username: user.username,  pseudo: user.pseudo }, process.env.JWT_SECRET, { expiresIn: '1h' });
    reply.send({ success: true, token, language: user.language || 'fr' });
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ message: '2FA service unavailable encore ' });
  }
});

/* -------------------------------
  ✅ Google sign-in
--------------------------------- */
fastify.post('/users/google-login', async (request, reply) => {
  console.log("rentre dans user_service");
  try {
    const { username, email, googleId, avatarUrl } = request.body;

    if (!googleId || !username) {
      return reply.status(400).send({ message: 'Champs requis manquants (googleId ou username)' });
    }

    const user = createOAuthUser({
      username,
      email,
      googleId,
      avatar_url: avatarUrl,
    });
    await fastify.markOnline(user.id);
    return reply.send(user);

  } catch (err) {
    console.error('Erreur dans /users/google-login :', err);
    reply.status(500).send({ message: 'Erreur interne user service' });
  }
});


/* -------------------------------
  ✅ Check session & profil
--------------------------------- */
// fastify.get('/check-session', async (request, reply) => {
//   try {
//     const authHeader = request.headers.authorization;
//     if (!authHeader) return reply.send({ isLoggedIn: false });

//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     reply.send({ 
//       isLoggedIn: true, 
//       username: decoded.username,
//       pseudo: decoded.pseudo
//     });
//   } catch (err) {
//     console.error("Erreur JWT:", err);
//     reply.send({ isLoggedIn: false });
//   }
// });


// fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
//   reply.send({ user: request.user });
// });
fastify.get('/check-session', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return reply.send({ isLoggedIn: false });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    reply.send({ isLoggedIn: true, username: decoded.username, pseudo: decoded.pseudo });
  } catch (err) {
    console.error("Erreur JWT:", err);
    reply.send({ isLoggedIn: false });
  }
});

fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  reply.send({ user: request.user });
});


/* -------------------------------
  ✅ Profile
--------------------------------- */
fastify.get('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const user = getUserByUsername(request.user.username);
  if (!user) return reply.code(404).send({ message: 'User not found' });

  reply.send({
    id: user.id,
    pseudo: user.pseudo,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatar_url,
  });
});

/* -------------------------------
  ✅ Changer mot de passe
--------------------------------- */
fastify.post('/change-password', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const { oldPassword, newPassword } = request.body;
  const user = getUserByUsername(request.user.username);

  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return reply.code(401).send({ message: 'Mot de passe incorrect' });

  const hashed = await bcrypt.hash(newPassword, 10);
  updatePassword(user.id, hashed);

  reply.send({ message: 'Mot de passe mis à jour' });
});

/* -------------------------------
  ✅ Modification pseudo et email
--------------------------------- */
fastify.put('/update-profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  
  console.log('=== UPDATE PROFILE DEBUG ===');
  console.log('Body:', request.body);
  console.log('User:', request.user);
  console.log('Headers:', request.headers);

  const { pseudo, email } = request.body || {};

  if (pseudo !== undefined && pseudo.length < 3) {
    return reply.code(400).send({ message: 'Le pseudo est trop court' });
  }
  if (email !== undefined && (typeof email !== 'string' || !email.includes('@'))) {
    return reply.code(400).send({ message: 'Email invalide' });
  }

  // Appelle la fonction d'update (modifiée pour gérer partiel)
  updateUserProfile(request.user.id, pseudo, email);

  return reply.send({ message: 'Profil mis à jour' });
});


/* -------------------------------
  ✅ Logout (frontend only)
--------------------------------- */
// fastify.post('/logout', { preHandler: [fastify.authenticate] }, async (_, reply) => {
//   reply.send({ success: true, message: 'Déconnexion réussie' });
// });
fastify.post('/auth/logout', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) return reply.code(400).send({ message: 'Token manquant' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await fastify.markOffline(decoded.userId);
    reply.send({ success: true, message: 'Déconnecté' });
  } catch (err) {
    reply.code(500).send({ message: 'Erreur lors du logout' });
  }
});

/* -------------------------------
  ✅ Routes additionnelles
--------------------------------- */
fastify.register(profileRoutes);
fastify.register(friendsRoutes, { prefix: '/friends' });

/* -------------------------------
  ✅ Lancer le serveur
--------------------------------- */
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`🚀 Server listening at ${address}`);
});

/* -------------------------------
  ✅ Langue utilisateur (GET / POST)
--------------------------------- */

// GET /language
fastify.get('/language', { preHandler: [fastify.authenticate] }, async (request, reply) => {
 
  const userId = request.user.id;
  try {
    const user = db.prepare('SELECT language FROM users WHERE id = ?').get(userId);
    if (!user) {
      return reply.code(404).send({ message: 'Utilisateur non trouvé' });
    }
    return reply.send({ language: user.language || 'fr' });
  } catch (err) {
    console.log('>> ERREUR SQL:', err);
    fastify.log.error(err);
    return reply.code(500).send({ message: 'Erreur interne' });
  }
});

// POST /language
fastify.post('/language', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const userId = request.user.id;
  const { lang } = request.body;

  if (!['fr', 'en', 'es'].includes(lang)) {
    return reply.code(400).send({ message: 'Langue invalide' });
  }

  try {
    const result = db.prepare('UPDATE users SET language = ? WHERE id = ?').run(lang, userId);
    if (result.changes === 0) {
      return reply.code(404).send({ message: 'Utilisateur non trouvé' });
    }

    return reply.send({ success: true, message: 'Langue mise à jour' });
  } catch (err) {
    fastify.log.error(err);
    return reply.code(500).send({ message: 'Erreur lors de la mise à jour' });
  }
});

export default fastify;