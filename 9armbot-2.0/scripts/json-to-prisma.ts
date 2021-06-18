// Migration players from JSON to Prisma
// Usage : npx dotenv-flow -- npx ts-node 9armbot-2.0/scripts/json-to-prisma.ts path/to/players.json

import { Db } from '../services/db'
import fs from 'fs'

const db = new Db()

const [, , filepath] = process.argv

interface PlayerV1_1 {
  version: string
  username: string
  level: number
  coins: number
  status: string
  exp: number
  rollCounter: number
  role: string
}

async function main() {
  const dataJson = fs.readFileSync(filepath, 'utf-8')

  const players = JSON.parse(dataJson) as PlayerV1_1[]

  console.log('[JSON] Players count:', players.length)

  const count = players.length

  async function migrate(player: PlayerV1_1, idx: number) {
    const counter = `${idx + 1}/${count} : ${player.username}`

    console.log('Start', counter)

    await db.createPlayer(player.username)

    console.log('Created', counter)

    const playerData = {
      status: player.status,
      coins: player.coins,
      roll_counter: player.rollCounter,
    }
    await db.updatePlayer(player.username, playerData)

    console.log('Updated', counter)

    const prismaPlayer = await db.getPlayerbyUsername(player.username)

    if (
      !prismaPlayer ||
      prismaPlayer.username != player.username.toLowerCase() ||
      prismaPlayer.status != player.status ||
      prismaPlayer.coins != player.coins ||
      prismaPlayer.roll_counter != player.rollCounter
    ) {
      console.log('Player data mismatched!', { prismaPlayer, player })
      process.exit(1)
    }

    console.log('Verified', counter)

    return
  }

  // Run sequentially
  await players.reduce(
    (p, player, idx) => p.then(() => migrate(player, idx)),
    Promise.resolve(),
  )

  console.log('Migration complete!')

  await db.disconnect()

  process.exit(0)
}

main()
