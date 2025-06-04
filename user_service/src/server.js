import Fastify from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import { createUser, getUserByUsername, updatePassword, updateUserAvatar } from './usersService.js';
import profileRoutes from './profileRoutes.js';
dotenv.config();

const fastify = Fastify({ logger: true });

// fastify.register(cors, { origin: '*' });
fastify.register(cors, {
  origin: ['http://localhost:5173'],  // <-- ici tu mets le port de ton front
  methods: ['GET', 'POST', 'PATCH','OPTIONS'],
});

fastify.register(fastifyCookie);

// 🔐 Middleware d’authentification JWT
fastify.decorate('authenticate', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new Error('No token provided');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
  } catch (err) {
    return reply.code(401).send({ message: 'Unauthorized' });
  }
});

// ✅ POST /signup
fastify.post('/signup', async (request, reply) => {
  const { username, password } = request.body;

  if (!username || typeof username !== 'string' || username.length < 3) {
    return reply.code(400).send({ message: 'Username too short' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return reply.code(400).send({ message: 'Password too short' });
  }

  if (getUserByUsername(username)) {
    return reply.code(400).send({ message: 'Username already taken' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  createUser(username, hashedPassword);

  reply.send({ success: true, message: 'User registered' });
});

// ✅ POST /auth/login
fastify.post('/auth/login', async (request, reply) => {
  const { username, password } = request.body;
  const user = getUserByUsername(username);
  if (!user) return reply.code(401).send({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return reply.code(401).send({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  reply.send({ success: true, token });
});

// ✅ GET /check-session (version JWT)
fastify.get('/check-session', async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.send({ isLoggedIn: false });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    reply.send({ isLoggedIn: true, username: decoded.username });
  } catch (err) {
    reply.send({ isLoggedIn: false });
  }
});

// ✅ GET /me (protégée)
fastify.get('/me', { preHandler: fastify.authenticate }, async (request, reply) => {
  reply.send({ user: request.user });
});

// // ✅ Route protégée exemple
// fastify.get('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
//   return { user: request.user };
// });

fastify.get('/profile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const user = getUserByUsername(request.user.username);
  if (!user) return reply.code(404).send({ message: 'User not found' });

  // Ici on transforme avatar_url en avatarUrl pour le frontend (camelCase)
  const userForFrontend = {
    username: user.username,
    avatarUrl: user.avatar_url,  // transformation explicite
  };

  return userForFrontend;
});



// ✅ POST /change-password (protégée)
fastify.post('/change-password', { preHandler: [fastify.authenticate] }, async (req, reply) => {
  const { oldPassword, newPassword } = req.body;
  const user = getUserByUsername(req.user.username);

  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) return reply.code(401).send({ message: 'Mot de passe incorrect' });

  const newHashed = await bcrypt.hash(newPassword, 10);
  updatePassword(user.id, newHashed);

  reply.send({ message: 'Mot de passe mis à jour' });
});


// ✅ POST /logout (optionnel pour frontend uniquement)
fastify.post('/logout', { preHandler: fastify.authenticate }, async (request, reply) => {
  // Le client doit simplement supprimer le token de son localStorage côté frontend
  reply.send({ success: true, message: 'Déconnexion réussie' });
});

// Routes spécifiques (avatar)
fastify.register(profileRoutes)

// ✅ Démarrage
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
