export const createMatch = {
  body: {
    type: 'object',
    required: ['isTournament', 'matchId', 'p1', 'p2', 'p1Score', 'p2Score', 'winner', 'spaceInvaders'],
    properties: {
      isTournament: { type: 'integer', minimum: 0 },
      matchId: { type: 'integer', minimum: 1 },
      p1: { type: 'integer' },
      p2: { type: 'integer' },
      p1Score: { type: 'integer' },
      p2Score: { type: 'integer' },
      winner: { type: 'integer' },
	  spaceInvaders: { type: 'integer' }
    }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        txHash: { type: 'string' }
      }
    }
  }
}
