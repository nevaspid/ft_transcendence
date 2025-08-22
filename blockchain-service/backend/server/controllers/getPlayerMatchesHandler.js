export async function getPlayerMatchesHandler(request, reply) {
  const { playerId } = request.params
  const contract = request.server.tournamentContract

  try {
    const matchIds = await contract.getPlayerMatches(playerId)

    return reply.send({
      matchIds: matchIds.map(id => Number(id))
    })
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({ error: 'Erreur lors de la récupération des matchs du joueur' })
  }
}
