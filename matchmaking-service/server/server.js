import Fastify from 'fastify'
import { postPlayerInRoomRoute } from "./routes/postPlayerInRoomRoute.js"
import { postPlayerInTournamentRoute } from "./routes/postPlayerInTournamentRoute.js"


const fastify = Fastify({
  logger: true
})

await app.register(postPlayerInRoomRoute)
await app.register(postPlayerInTournamentRoute)

fastify.listen({ port: 3101 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
