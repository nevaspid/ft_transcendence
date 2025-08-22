export const getTournamentData = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 }
    }
  },
  response: {
    200: {
      type: 'object',
      required: ['tournamentName', 'tournamentId', 'nbPlayers', 'matchIds'],
      properties: {
        tournamentName: { type: 'string' },
        tournamentId: { type: 'integer' },
        nbPlayers: { type: 'integer' },
        matchIds: {
          type: 'array',
          items: { type: 'integer' }
        }
      }
    }
  }
}
