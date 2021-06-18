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

  const playersWithUpperCasedName: PlayerV1_1[] = []

  async function migrate(
    player: PlayerV1_1,
    idx: number,
    mergeCoins: Boolean = false,
  ) {
    const counter = `${idx + 1}/${count} : ${player.username}`

    console.log('Start', counter)

    if (!mergeCoins && !!player.username.match(/[A-Z]/)) {
      console.log('Found player with uppercased name! Process them later...')
      playersWithUpperCasedName.push(player)
      return
    }

    const upsertedPlayer = await db.createPlayer(player.username)

    console.log('Created', counter)

    const playerData = {
      status: player.status,
      coins: player.coins,
      roll_counter: player.rollCounter,
    }

    if (mergeCoins) {
      playerData.coins += upsertedPlayer.coins
    }

    await db.updatePlayer(player.username, playerData)

    console.log('Updated', counter)

    const prismaPlayerForRecheck = await db.getPlayerbyUsername(player.username)

    if (
      !prismaPlayerForRecheck ||
      prismaPlayerForRecheck.username != player.username.toLowerCase() ||
      prismaPlayerForRecheck.status != player.status ||
      prismaPlayerForRecheck.coins != playerData.coins ||
      prismaPlayerForRecheck.roll_counter != player.rollCounter
    ) {
      console.log('Player data mismatched!', {
        prismaPlayerForRecheck,
        player,
        playerData,
      })
      process.exit(1)
    }

    console.log('Verified', counter)

    return
  }

  // Run sequentially
  await players.reduce(
    (p, player, idx) => p.then(() => migrate(player, idx, false)),
    Promise.resolve(),
  )

  console.log(
    'Processing players with uppercased names : ',
    playersWithUpperCasedName.length,
  )

  await playersWithUpperCasedName.reduce(
    (p, player, idx) => p.then(() => migrate(player, idx, true)),
    Promise.resolve(),
  )

  console.log('Migration complete!')

  await db.disconnect()

  process.exit(0)
}

main()
