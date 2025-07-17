const fastify = require('fastify');
const cors = require('@fastify/cors');
const twofaRoutes = require('./twofaRoutes');

const app = fastify({ logger: true });

app.register(require('@fastify/cors'), {
  origin: ['http://localhost:5173', 'https://localhost:8443']
});


app.register(twofaRoutes, { prefix: "/twofa" });


const start = async () => {
  try {
    await app.listen({ port: 4001,  host: '0.0.0.0'});
    console.log("2FA service en écoute sur http://localhost:4001");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
