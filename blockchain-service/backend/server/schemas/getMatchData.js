export const getMatchData = {
	params : {
		type: 'object',
		required: ['id'],
		properties: {
			id: {
				type: 'integer',
				minimum: 0
			}
		}
	},
  response: {
	200: {
      type: 'object',
	  required: ['matchId', 'p1', 'p1Score', 'p2', 'p2Score', 'winner'],
      properties: {
        matchId: { type: 'integer' },
        p1: { type: 'string' },
        p1Score: { type: 'integer' },
        p2: { type: 'string' },
        p2Score: { type: 'integer' },
        winner: { type: 'string' }
      }
    }
  }
}
