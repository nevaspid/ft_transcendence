import Fastify from 'fastify'



const fastify = Fastify({
  logger: true
})

fastify.listen({ port: 3001 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
