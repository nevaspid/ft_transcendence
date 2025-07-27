export async function createTournamentHandler(request, reply) {
  const { tournamentName, tournamentId, nbPlayers } = request.body
  const contract = request.server.tournamentContract

  try {
    const tx = await contract.createTournament(tournamentName, tournamentId, nbPlayers)
    await tx.wait()

    return reply.send({
      success: true,
      txHash: tx.hash
    })
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({ error: 'Erreur lors de la création du tournoi' })
  }
}
