import { getMatchDataHandler } from '../controllers/getMatchDataHandler.js'
import { getMatchData } from '../schemas/getMatchData.js'

export async function getMatchDataRoute(fastify) {
  fastify.get('/matches/:id', {
    schema: getMatchData,
    handler: getMatchDataHandler
  })
}
