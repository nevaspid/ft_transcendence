import { getTournamentDataHandler } from '../controllers/getTournamentDataHandler.js'
import { getTournamentData } from '../schemas/getTournamentData.js'

export async function getTournamentDataRoute(fastify) {
  fastify.get('/tournament/:id', {
    schema: getTournamentData,
    handler: getTournamentDataHandler
  })
}
