export const postPlayerInTournament = {
	body: {
		type: 'object',
		properties: {playerId: {type: 'integer', minimum: 0}},
		required: ['playerId'],
	},
	response: {
		200: {
			type: 'object',
			properties: {
				status: {type: 'string'},
				player1Id: {type: 'integer', minimum: 0},
				player2Id: {type: 'integer', minimum: 0},
				player3Id: {type: 'integer', minimum: 0},
				player4Id: {type: 'integer', minimum: 0},
			},
			required: ['status']
		}
	}
}
