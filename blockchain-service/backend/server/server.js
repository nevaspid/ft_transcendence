import Fastify from 'fastify'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { JsonRpcProvider, Wallet, Contract } from 'ethers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load contract address from JSON file
const contractAddressPath = path.join(__dirname, 'contract-address.json')
let contractAddress = null
try {
	const addressData = JSON.parse(readFileSync(contractAddressPath, 'utf-8'))
	contractAddress = addressData.address
	if (!contractAddress) throw new Error('Missing address')
} catch (err) {
	console.error('❌ Failed to load contract address:', err.message)
	process.exit(1)
}

// Load ABI JSON
const abiPath = path.join(__dirname, '../../artifacts/contracts/tournament.sol/Tournament.json')
const abiFile = JSON.parse(readFileSync(abiPath, 'utf-8'))
const abi = abiFile.abi

// Init provider + signer + contract
const provider = new JsonRpcProvider(process.env.RPC_URL)
const wallet = new Wallet(process.env.PRIVATE_KEY, provider)
const contract = new Contract(contractAddress, abi, wallet)

// Create Fastify instance
const app = Fastify({ logger: true })
app.decorate('tournamentContract', contract)

// Register routes
import { createMatchRoute } from './routes/createMatchRoute.js'
import { getMatchDataRoute } from './routes/getMatchDataRoute.js'
import { createTournamentRoute } from './routes/createTournamentRoute.js'
import { getTournamentDataRoute } from './routes/getTournamentDataRoute.js'
import { getPlayerMatchesRoute } from './routes/getPlayerMatchesRoute.js'

await app.register(createMatchRoute)
await app.register(createTournamentRoute)
await app.register(getMatchDataRoute)
await app.register(getTournamentDataRoute)
await app.register(getPlayerMatchesRoute)

// Start the server
try {
	const PORT = process.env.PORT || 3100
	app.listen({ port: PORT, host: '0.0.0.0' })
	console.log(`✅ Server running on http://localhost:${PORT}`)
} catch (err) {
	app.log.error(err)
	process.exit(1)
}
