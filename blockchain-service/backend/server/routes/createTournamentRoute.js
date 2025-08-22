import { createTournamentHandler } from '../controllers/createTournamentHandler.js'
import { createTournament } from '../schemas/createTournament.js'

export async function createTournamentRoute(fastify) {
  fastify.post('/createTournament', {
    schema: createTournament,
    handler: createTournamentHandler
  })
}
