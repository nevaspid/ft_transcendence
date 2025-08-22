export const getPlayerMatches = {
  params: {
    type: 'object',
    required: ['playerId'],
    properties: {
      playerId: { type: 'integer', minimum: 1 }
    }
  },
  response: {
    200: {
      type: 'object',
      required: ['matchIds'],
      properties: {
        matchIds: {
          type: 'array',
          items: { type: 'integer' }
        }
      }
    }
  }
}
