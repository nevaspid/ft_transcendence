require('dotenv').config();
const fastify = require('fastify');
const cors = require('@fastify/cors');
const twofaRoutes = require('./twofaRoutes');

const host = process.env.SERVER_HOST;
const app = fastify({ logger: true });


app.register(require('@fastify/cors'), {
  origin: [
    `http://${host}:5173`,
    `https://${host}:8443`
    ]
});

app.register(twofaRoutes, { prefix: "/twofa" });


const start = async () => {
  try {
    await app.listen({ port: 4001,  host: '0.0.0.0'});
    console.log("2FA service en écoute sur http://${host}:4001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
