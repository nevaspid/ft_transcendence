import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const idsPath = path.join(__dirname, '../ids.json')

export async function nextIdsHandler(request, reply) {
  const { type } = request.body
  try {
    const raw = readFileSync(idsPath, 'utf-8')
    const data = JSON.parse(raw)
    if (type === 'match') {
      data.matchId = (data.matchId || 0) + 1
      writeFileSync(idsPath, JSON.stringify(data, null, 2), 'utf-8')
      return reply.send({ matchId: data.matchId })
    }
    if (type === 'tournament') {
      data.tournamentId = (data.tournamentId || 0) + 1
      writeFileSync(idsPath, JSON.stringify(data, null, 2), 'utf-8')
      return reply.send({ tournamentId: data.tournamentId })
    }
    return reply.code(400).send({ error: 'Invalid type' })
  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({ error: 'Cannot read/write ids.json' })
  }
}


