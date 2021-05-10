import { ErrorResult, DataResult } from '../bot'
import { Db } from '../db'

const db = new Db()

export interface GachaResult extends DataResult {
  data: {
    state: 'win' | 'lose'
    bet: number
    win: number
    balance: number
  }
}

async function gacha(
  username?: string | null,
  bet: number = 1,
): Promise<GachaResult | ErrorResult> {
  if (!username || bet <= 0 || Number.isNaN(bet)) {
    return { error: 'input_invalid' }
  }

  const player = await db.getPlayerbyUsername(username)

  if (!player) {
    return { error: 'player_not_found' }
  }

  let { coins } = player

  if (coins < bet) {
    return { error: 'not_enough_coin' }
  }

  let result = {
    bet,
    win: 0,
    state: 'lose',
    balance: 0,
  }

  coins -= bet

  // TODO: reimplement roll()
  if (Math.random() < 0.1) {
    // Win
    const winAmount = bet * 2 // TODO: change amount
    coins += winAmount

    result.win = winAmount
    result.state = 'win'
    result.balance = coins
  } else {
    // Lose
    result.balance = coins
  }

  await db.updatePlayer(player.username, { coins })

  return { data: result } as GachaResult
}

export default gacha
