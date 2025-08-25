export async function getMatchDataHandler(request, reply) {
  const { id } = request.params
  const contract = request.server.tournamentContract

  try {
    const match = await contract.getMatchData(id)

    const formattedMatch = {
      matchId: Number(id),
      p1: Number(match.p1),
      p1Score: Number(match.p1Score),
      p2: Number(match.p2),
      p2Score: Number(match.p2Score),
      winner: Number(match.winner),
      spaceInvaders: Number(match.spaceInvaders),
      isTournament: Number(match.isTournament)
    }

    return reply.send(formattedMatch)
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({ error: 'error while retrieving match data' })
  }
}
