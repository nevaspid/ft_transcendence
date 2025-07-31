export const postPlayerInRoom = {
	body: {
		type: 'object',
		properties: {playerId: {type: 'integer', minimum: 0}},
		required: ['playerId'],
	},
	response: {
		200: {
			type: 'object',
			properties: {
				playerId: {type: 'integer', minimum: 0},
				roomId: {type: 'integer', minimum: 0},
			},
			required: ['playerId', 'roomId'],
		}
	}
}
