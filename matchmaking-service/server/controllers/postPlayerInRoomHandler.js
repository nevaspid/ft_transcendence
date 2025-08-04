let playersWaiting = []

export async function postPlayerInRoomHandler(request, reply) {
	const { playerId } = request.body

	playersWaiting.push(playerId)
	if (playersWaiting.length >= 2) {
		let player1 = playersWaiting.shift()
		let player2 = playersWaiting.shift()

		return res.send({
    	status: 'matched',
    	players: [player1, player2],
    	})
	}
	return res.send({ status: 'waiting' })
}
