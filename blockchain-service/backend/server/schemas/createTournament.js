export const createTournament = {
  body: {
    type: 'object',
    required: ['tournamentName', 'tournamentId', 'nbPlayers'],
    properties: {
      tournamentName: { type: 'string', minLength: 1 },
      tournamentId: { type: 'integer', minimum: 1 },
      nbPlayers: { type: 'integer', minimum: 2 }
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
