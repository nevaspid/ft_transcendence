import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pump = promisify(pipeline);
const fastify = Fastify({ logger: true });

fastify.register(cors, {
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST'],
});


// Plugin multipart pour gérer les fichiers uploadés
fastify.register(multipart);

// Middleware d'authentification basique (à adapter)
fastify.decorate("authenticate", async function(request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) throw new Error("No auth header");

    const token = authHeader.split(" ")[1];
    request.user = { username: token }; // à remplacer avec vérification réelle
  } catch (err) {
    reply.code(401).send({ error: "Unauthorized" });
  }
});


// ✅ 1. Route pour lister les avatars disponibles dans uploads/choices
fastify.get('/api/avatars', async (request, reply) => {
  const choicesDir = path.join(__dirname, 'uploads', 'choices');

  try {
    const files = fs.readdirSync(choicesDir).filter(file =>
      /\.(png|jpe?g|gif)$/i.test(file)
    );

    const urls = files.map(file => `/uploads/choices/${file}`);
    return { avatars: urls };
  } catch (err) {
    reply.code(500).send({ error: "Impossible de lire les avatars disponibles." });
  }
});


// ✅ 2. Route pour sélectionner un avatar parmi ceux existants
fastify.post('/api/profile/avatar/select', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const body = await request.body;
  const selectedAvatar = body.avatar; // ex: "/uploads/choices/avatar1.png"

  if (!selectedAvatar || typeof selectedAvatar !== 'string') {
    return reply.code(400).send({ error: "avatar field is required" });
  }

  const choicesDir = path.join(__dirname, 'uploads', 'choices');
  const avatarFilename = path.basename(selectedAvatar); // sécurité : éviter les chemins absolus
  const sourcePath = path.join(choicesDir, avatarFilename);

  if (!fs.existsSync(sourcePath)) {
    return reply.code(404).send({ error: "Avatar not found" });
  }

  const userDir = path.join(__dirname, 'uploads', request.user.username);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const destPath = path.join(userDir, 'avatar' + path.extname(avatarFilename));

  fs.copyFileSync(sourcePath, destPath);

  const publicUrl = `/uploads/${request.user.username}/${path.basename(destPath)}`;
  return { success: true, avatarUrl: publicUrl };
});


// ✅ 3. Sert les fichiers statiques (avatars + uploads utilisateurs)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/',
});

// ✅ 4. Lancer le serveur
fastify.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('Avatar service lancé sur http://localhost:3001');
});


