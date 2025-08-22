import { createMatchHandler } from '../controllers/createMatchHandler.js'
import { createMatch } from '../schemas/createMatch.js'

export async function createMatchRoute(fastify) {
  fastify.post('/matches', {
    schema: createMatch,
    handler: createMatchHandler
  })
}
