import { ErrorResult, Result } from '../bot'
import { Db } from '../db'

const db = new Db()

interface GachaResult extends Result {
  data: number
}

async function gacha(
  username?: string | null,
  amount: number = 1,
): Promise<GachaResult | ErrorResult> {
  if (!username) {
    return { error: 'input_invalid' }
  }

  const player = await db.getPlayerbyUsername(username)

  if (!player) {
    return { error: 'player_not_found' }
  }

  let { coins } = player

  if (coins < amount) {
    return { error: 'not_enough_coin' }
  }

  // TODO: reimplement roll()
  if (Math.random() < 0.1) {
    // Win
    coins += amount
  } else {
    // Lose
    coins -= amount
  }

  await db.updatePlayer(player.username, { coins })

  return { data: coins }
}

export default gacha
