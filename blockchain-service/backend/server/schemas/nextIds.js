export const nextIdsSchema = {
  body: {
    type: 'object',
    required: ['type'],
    properties: {
      type: { type: 'string', enum: ['match', 'tournament'] }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        matchId: { type: 'integer' },
        tournamentId: { type: 'integer' }
      }
    }
  }
}


