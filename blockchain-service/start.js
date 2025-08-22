import { exec } from 'child_process'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const path = require('path')

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

    console.log('✅ Contract deployed, launching server...')
    await runScript('node ./backend/server/server.js')
  } catch (err) {
    console.error('❌ launch failed :', err)
    process.exit(1)
  }
}

main()
