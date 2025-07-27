import { getPlayerMatchesHandler } from '../controllers/getPlayerMatchesHandler.js'
import { getPlayerMatches } from '../schemas/getPlayerMatches.js'

export async function getPlayerMatchesRoute(fastify) {
  fastify.get('/playerMatches/:playerId', {
    schema: getPlayerMatches,
    handler: getPlayerMatchesHandler
  })
}
