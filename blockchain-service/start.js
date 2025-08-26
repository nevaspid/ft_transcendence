import { exec } from 'child_process'
import { createRequire } from 'module'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const require = createRequire(import.meta.url)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const idsPath = path.join(__dirname, 'backend/server/ids.json')

const data = {
	matchId: 0,
	tournamentId: 0
}

function runScript(cmd) {
  return new Promise((resolve, reject) => {
    const subprocess = exec(cmd, { cwd: path.resolve('./') })
    subprocess.stdout.pipe(process.stdout)
    subprocess.stderr.pipe(process.stderr)
    subprocess.on('exit', (code) => {
      if (code !== 0) return reject(new Error(`Process exited with code ${code}`))
      resolve()
    })
  })
}

async function main() {
  try {
    console.log('🚀 Deploying contract...')
    await runScript('npx hardhat run ./scripts/deploy.js --network fuji')
	writeFileSync(idsPath, JSON.stringify(data, null, 2), "utf-8"); //reset le json

    console.log('✅ Contract deployed, launching server...')
    await runScript('node ./backend/server/server.js')
  } catch (err) {
    console.error('❌ launch failed :', err)
    process.exit(1)
  }
}

main()
