import { postPlayerInTournament } from "../schemas/postPlayerInTournament.js";
import { postPlayerInTournamentHandler } from "../controllers/postPlayerInTournamentHandler.js";

export async function postPlayerInTournamentRoute(fastify) {
	fastify.post('/playerWaitingTournament/:playerId', {
		schema: postPlayerInTournament,
		handler: postPlayerInTournamentHandler
	})
}
