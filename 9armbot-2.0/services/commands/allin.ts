import { ErrorResult, DataResult } from '../bot'
import { Db } from '../db'
import Setting from '../setting'

const db = new Db()

export interface AllInResult extends DataResult {
  data: {
    state: 'win' | 'lose' | 'win_jackpot'
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

  // FIXME: use global setting?
  const setting = await Setting.init()

  const dice = Math.random()

  if (dice < setting.jackpotRate) {
    // Win jackpot
    const winAmount = Math.round(bet * (5 + Math.random() * 5)) * 2
    coins += winAmount

    result.win = winAmount
    result.state = 'win_jackpot'
    result.balance = coins
  } else if (dice < setting.gachaRate) {
    // Win
    const winAmount = Math.round(bet * (2 + Math.random() * 3)) * 2
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
