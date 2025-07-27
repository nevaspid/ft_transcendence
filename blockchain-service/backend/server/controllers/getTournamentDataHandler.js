export async function getTournamentDataHandler(request, reply) {
  const { id } = request.params
  const contract = request.server.tournamentContract

  try {
    const [tournamentName, tournamentId, nbPlayers, matchIds] = await contract.getTournamentData(id)

    return reply.send({
      tournamentName,
      tournamentId: Number(tournamentId),
      nbPlayers: Number(nbPlayers),
      matchIds: matchIds.map(n => Number(n))
    })
  } catch (err) {
    request.log.error(err)
    return reply.code(404).send({ error: 'Tournoi introuvable ou erreur de lecture' })
  }
}
