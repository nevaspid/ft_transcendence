import pkg from 'hardhat';
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { ethers } = pkg;
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const CONTRACT_NAME = 'Tournament'

  const Contract = await ethers.getContractFactory(CONTRACT_NAME)
  const contract = await Contract.deploy()
  await contract.waitForDeployment()

  const address = contract.target.trim()
  console.log(`✅ Contract ${CONTRACT_NAME} deployed at : ${address}`)

  const jsonPath = path.join(__dirname, '../backend/server/contract-address.json')
  fs.writeFileSync(jsonPath, JSON.stringify({ address }, null, 2))

  console.log(`📝 Address written in ${jsonPath}`)
}

main().catch((err) => {
  console.error('❌ Error in deploy.js:', err)
  process.exit(1)
})
