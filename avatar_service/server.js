import Fastify from 'fastify';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import fastifyStatic from '@fastify/static';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { fileURLToPath } from 'url';
import fastifyJwt from 'fastify-jwt';
import dotenv from 'dotenv';

// 🔐 Chargement des variables d'environnement (.env)
dotenv.config();

// ----------------------------
// 📁 Définition des chemins
// ----------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pump = promisify(pipeline);
const fastify = Fastify({ logger: true });


// -----------------------------
// 🔓 Configuration CORS
// -----------------------------
// Permet à des apps front (ex: React) sur d'autres ports d'accéder à ce backend

fastify.register(cors, {
  origin: [
      'https://localhost:8443',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000',
      'http://localhost:8443',
    ],
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'PUT'],
  credentials: true,
});


// ----------------------------------
// 📤 Plugin pour gérer les fichiers
// ----------------------------------

fastify.register(multipart);

// ----------------------------------
// 🔐 Authentification JWT
// ----------------------------------

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
});

// Middleware d’authentification : vérifie le token JWT

fastify.decorate("authenticate", async function(request, reply) {
  try {
    await request.jwtVerify(); // Vérifie le token et ajoute les infos dans request.user
    // Si ok, request.user contient l'objet décodé du token (ex : { userId: 2, username: "emy", ... })
  } catch (err) {
    reply.code(401).send({ error: "Unauthorized" });
  }
});

// -------------------------------------------------------------------
// ✅ ROUTES DE GESTION DU PROFIL + AVATARS
// -------------------------------------------------------------------


// 🔍 Route GET /api/avatars
// Liste tous les avatars "préfabriqués" disponibles dans /uploads/choices
fastify.get('/api/avatars', async (request, reply) => {
  const choicesDir = path.join(__dirname, 'uploads', 'choices');

  try {
    const files = fs.readdirSync(choicesDir).filter(file =>
      /\.(png|jpe?g|gif)$/i.test(file)
    );

    const urls = files.map(file => `/uploads/choices/${file}`);
    return { avatars: urls }; // Renvoie un tableau d'URLs des avatars
  } catch (err) {
    reply.code(500).send({ error: "Impossible de lire les avatars disponibles." });
  }
});


// 🖼️ Route POST /api/profile/avatar/select
// Permet à un utilisateur de **choisir un avatar existant**
fastify.post('/api/profile/avatar/select', { preHandler: [fastify.authenticate] }, async (request, reply) => {
  const body = await request.body;
  const selectedAvatar = body.avatar;  // Chemin de l'avatar choisi, ex: /uploads/choices/avatar1.png
  if (!selectedAvatar || typeof selectedAvatar !== 'string') {
    return reply.code(400).send({ error: "avatar field is required" });
  }

  const choicesDir = path.join(__dirname, 'uploads', 'choices');
  const avatarFilename = path.basename(selectedAvatar); // 🔐 sécurité : évite les chemins absolus
  const sourcePath = path.join(choicesDir, avatarFilename);

  if (!fs.existsSync(sourcePath)) {
    return reply.code(404).send({ error: "Avatar not found" });
  }

  // 📁 Crée le dossier de l'utilisateur s'il n'existe pas
  const userDir = path.join(__dirname, 'uploads', request.user.username);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const destPath = path.join(userDir, 'avatar' + path.extname(avatarFilename));

  // Copie l'image choisie dans le dossier perso de l'utilisateur
  fs.copyFileSync(sourcePath, destPath);

  const publicUrl = `/uploads/${request.user.username}/${path.basename(destPath)}`;
  return { success: true, avatarUrl: publicUrl }; // URL publique de l'avatar sélectionné
});


// 📁 Sert les fichiers statiques dans /uploads
// ➜ Permet d’accéder aux avatars via des URLs (ex: /uploads/mon_user/avatar.png)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'uploads'),
  prefix: '/uploads/',
});

// 📤 Route POST /api/profile/avatar/upload
// Permet à l’utilisateur d’uploader un avatar personnalisé
fastify.post('/api/profile/avatar/upload', {
  preHandler: [fastify.authenticate],
}, async (request, reply) => {
  try {
    const parts = request.parts();

    for await (const part of parts) {
      if (part.file) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        if (!allowedTypes.includes(part.mimetype)) {
          return reply.code(400).send({ error: 'Format de fichier non supporté.' });
        }

        const cleanFilename = path.basename(part.filename);
        const ext = path.extname(cleanFilename).toLowerCase();
        const clientName = request.user.username.replace(/[^a-zA-Z0-9_-]/g, '_');

        const clientDir = path.join(__dirname, 'uploads', 'client');
        if (!fs.existsSync(clientDir)) {
          fs.mkdirSync(clientDir, { recursive: true });
        }

        const newFilename = `avatar-${clientName}${ext}`;
        const filePath = path.join(clientDir, newFilename);

        // 📥 Enregistre l’image dans /uploads/client
        await pump(part.file, fs.createWriteStream(filePath));

        const publicUrl = `/uploads/client/${newFilename}`;
        return reply.send({ success: true, avatar_url: publicUrl });
      }
    }

    return reply.code(400).send({ error: 'Aucun fichier envoyé.' });
  } catch (err) {
    request.log.error(err);
    return reply.code(500).send({ error: 'Erreur serveur lors de l\'upload.' });
  }
});

// 🟢 Lancement du serveur sur le port 3001
fastify.listen({ port: 3001, host: '0.0.0.0' }, (err) => {
  if (err) throw err;
  console.log('Avatar service lancé sur http://localhost:3001');
});