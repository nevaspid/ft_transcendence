// export const getMatchData = {
// 	params : {
// 		type: 'object',
// 		required: ['id'],
// 		properties: {
// 			id: {
// 				type: 'integer',
// 				minimum: 1
// 			}
// 		}
// 	},
//   response: {
// 	200: {
//       type: 'object',
// 	  required: ['matchId', 'p1', 'p1Score', 'p2', 'p2Score', 'winner', 'spaceInvaders'],
//       properties: {
//         matchId: { type: 'integer' },
//         p1: { type: 'integer' },
//         p1Score: { type: 'integer' },
//         p2: { type: 'integer' },
//         p2Score: { type: 'integer' },
//         winner: { type: 'integer' },
// 		spaceInvaders: { type: 'integer' }
//       }
//     }
//   }
// }

export const getMatchData = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer', minimum: 1 }
    }
  },
  response: {
    200: {
      type: 'object',
      required: ['matchId', 'p1', 'p1Score', 'p2', 'p2Score', 'winner', 'spaceInvaders', 'isTournament'],
      properties: {
        matchId: { type: 'integer' },
        p1: { type: 'integer' },
        p1Score: { type: 'integer' },
        p2: { type: 'integer' },
        p2Score: { type: 'integer' },
        winner: { type: 'integer' },
        spaceInvaders: { type: 'integer' },
        isTournament: { type: 'integer', default: 0 } // par défaut 0 si pas de tournoi
      }
    }
  }
}
