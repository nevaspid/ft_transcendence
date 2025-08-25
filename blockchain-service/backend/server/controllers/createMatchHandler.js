export async function createMatchHandler(request, reply) {
  const { isTournament, matchId, p1, p2, p1Score, p2Score, winner, spaceInvaders } = request.body
  const contract = request.server.tournamentContract

  try {
    const tx = await contract.createMatch(
      isTournament,
      matchId,
      p1Score,
      p2Score,
      p1,
      p2,
      winner,
	    spaceInvaders
    )
    await tx.wait()

    return reply.send({ success: true, txHash: tx.hash })
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({ error: 'Error while uploading match' })
  }
}
