const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const axios = require("axios"); // 👈 ajoute ça

console.log("twofaRoutes loaded");

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
async function twofaRoutes(fastify) {
  // Génération du secret + QR code
  fastify.get("/generate", async (request, reply) => {
    const { username } = request.query;
    if (!username) return reply.status(400).send({ message: "Username is required" });

    const secret = speakeasy.generateSecret({ name: `MyApp (${username})` });

    // 👉 Sauvegarde le secret "pending" via user_service
    await axios.put(`http://user_service:3000/users/${encodeURIComponent(username)}/pending_twofa_secret`, {
      secret: secret.base32,
    });

    const qr = await qrcode.toDataURL(secret.otpauth_url);

    return reply.send({ otpauth_url: secret.otpauth_url, secret: secret.base32, qr });
  });

  // Activation 2FA après confirmation du code
  fastify.post("/activate", async (request, reply) => {
    const { username, token } = request.body;
    

    if (!username || !token) return reply.status(400).send({ message: "Username and token required" });

    // 👉 Récupère le secret "pending" via user_service
    const res = await axios.get(`http://user_service:3000/users/${encodeURIComponent(username)}`);
    const pendingSecret = res.data.pending_two_factor_secret;
    console.log("pendingSecret:", pendingSecret);
    if (!pendingSecret) {
      return reply.status(400).send({ message: "No pending secret" });
    }

    console.log("Token reçu :", token);
    console.log("Secret utilisé :", pendingSecret);

    const tokenGenerated = speakeasy.totp({
      secret: pendingSecret,
      encoding: 'base32',
    });
    console.log("Token attendu :", tokenGenerated);

    const valid = speakeasy.totp.verify({
      secret: pendingSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!valid) {
      return reply.status(401).send({ message: "Invalid code" });
    }

    // 👉 Active 2FA via user_service
    await axios.put(`http://user_service:3000/users/${encodeURIComponent(username)}/activate_twofa`, {
      secret: pendingSecret
    });

    return reply.send({ success: true });
  });

 fastify.post("/verify", async (request, reply) => {
  const { username, token } = request.body;

  if (!username || !token) {
    console.log("Requête incomplète:", request.body);
    return reply.status(400).send({ message: "Username and token required" });
  }

  let userSecret;
  try {
    const res = await axios.get(`http://user_service:3000/users/${encodeURIComponent(username)}`);
    userSecret = res.data.pending_two_factor_secret;
    console.log(`Secret récupéré pour ${username}: ${userSecret}`);
  } catch (err) {
    console.error("Erreur récupération utilisateur:", err.message);
    return reply.status(400).send({ message: "Utilisateur non trouvé" });
  }

  if (!userSecret) {
    console.warn(`2FA non activé pour ${username}`);
    return reply.status(400).send({ message: "2FA not activated" });
  }

  const expectedToken = speakeasy.totp({
    secret: userSecret,
    encoding: "base32",
  });

  console.log(`Code attendu pour ${username}: ${expectedToken}, code reçu: ${token}`);

  const verified = speakeasy.totp.verify({
    secret: userSecret,
    encoding: "base32",
    token: token.toString(),
    window: 1,
  });

  console.log(`Résultat vérification pour ${username}:`, verified);

  return reply.send({ success: verified });
});

// 👉 Active 2FA sur la page de login via user_service
fastify.post("/verify2", async (request, reply) => {
  const { token, secret } = request.body;

  if (!token || !secret) {
    console.log("Requête incomplète:", request.body);
    return reply.status(400).send({ message: "Token and secret required" });
  }

  const expectedToken = speakeasy.totp({
    secret: secret,
    encoding: "base32",
  });

  console.log(`Code attendu: ${expectedToken}, code reçu: ${token}`);

  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token.toString(),
    window: 1,
  });

  console.log(`Résultat vérification:`, verified);

  return reply.send({ verified });
});
}

module.exports = twofaRoutes;

