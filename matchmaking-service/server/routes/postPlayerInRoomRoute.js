import { postPlayerInRoom } from "../schemas/postPlayerInRoom.js";
import { postPlayerInRoomHandler } from "../controllers/postPlayerInRoomHandler.js";

export async function postPlayerInRoomRoute(fastify) {
	fastify.post('/playerWaiting/:playerId', {
		schema: postPlayerInRoom,
		handler: postPlayerInRoomHandler
	})
}
