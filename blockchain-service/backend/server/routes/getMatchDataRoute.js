import { getMatchDataHandler } from '../controllers/getMatchDataHandler.js'
import { getMatchData } from '../schemas/getMatchData.js'

export async function matchRoutes(fastify) {
  fastify.get('/matches/:id', {
    schema: getMatchData,
    handler: getMatchDataHandler
  })
}
