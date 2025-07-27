import ethers from 'ethers'
import abi from '../../../artifacts/contracts/tournament.sol' assert { type: 'json' }

//initialisation of provider from URL RPC in .env
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)

//instance of contract
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  provider
)

export async function getMatchDataHandler(request, reply) {

	const { id } = request.params

	try {
		const match = await contract.getMatch(id)

    	const formattedMatch = {
      	matchId: id,
      	p1: match.p1,
      	p1Score: match.p1Score,
      	p2: match.p2,
      	p2Score: match.p2Score,
      	winner: match.winner
    	}
    return reply.send(formattedMatch)
  	} catch (err) {
    	request.log.error(err)
    	return reply.code(500).send({ error: 'error while retrieving match datas' })
  	}
}
