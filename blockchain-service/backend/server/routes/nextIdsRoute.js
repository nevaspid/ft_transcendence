import { nextIdsHandler } from '../controllers/nextIdsHandler.js'
import { nextIdsSchema } from '../schemas/nextIds.js'

export async function nextIdsRoute(app) {
  app.post('/nextId', { schema: nextIdsSchema }, nextIdsHandler)
}


