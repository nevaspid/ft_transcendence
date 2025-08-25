import { nextIdsHandler } from '../controllers/nextIdsHandler.js'
import { nextIdsSchema } from '../schemas/nextIds.js'

export async function nextIdsRoute(fastify) {
  fastify.post('/next', {
	schema: nextIdsSchema,
	handler: nextIdsHandler
	})
}


