import { ErrorResult, DataResult } from '../bot'
import { Db } from '../db'

const db = new Db()

export interface AllInResult extends DataResult {
  data: {
    state: 'win' | 'lose'
    bet: number
    win: number
    balance: number
  }
}

export async function allin(
  username?: string | null,
): Promise<AllInResult | ErrorResult> {
  if (!username) {
    return { error: 'input_invalid' }
  }

  const player = await db.getPlayerbyUsername(username)

  if (!player) {
    return { error: 'player_not_found' }
  }

  let { coins } = player

  if (coins == 0) {
    return { error: 'not_enough_coin' }
  }

  const bet = coins
  let result = {
    bet,
    win: 0,
    state: 'lose',
    balance: 0,
  }

  coins = 0

  // TODO: reimplement roll()
  if (Math.random() < 0.1) {
    // Win
    const winAmount = bet * 5 // TODO: change amount
    coins += winAmount

    result.win = winAmount
    result.state = 'win'
    result.balance = coins
  } else {
    // Lose
    result.balance = coins
  }

  await db.updatePlayer(player.username, { coins })

  return { data: result } as AllInResult
}
