let playersWaiting = []

export async function postPlayerInTournamentHandler(request, reply) {
	const { playerId } = request.body

	if (playersWaiting.length === 4)
		return res.status(403).send({ error: 'Tournament is full' })

	playersWaiting.push(playerId)

	if (playersWaiting.length >= 4) {
		let player1 = playersWaiting.shift()
		let player2 = playersWaiting.shift()
		let player3 = playersWaiting.shift()
		let player4 = playersWaiting.shift()


		return res.send({
    	status: 'matched',
    	players: [player1, player2, player3, player4],
    	})
	}
	return res.send({ status: 'waiting' })
}
