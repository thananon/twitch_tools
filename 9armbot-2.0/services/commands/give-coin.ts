import { ErrorResult, DataResult } from '../bot'
import Player from '../models/player'

export interface GiveCoinResult extends DataResult {
  data: number
}

async function giveCoin(
  fromUsername: string,
  playerName: string,
  amount = 10,
): Promise<GiveCoinResult | ErrorResult> {
  const fromUser = await Player.withUsername(fromUsername)

  if ((await fromUser.isAdmin()) === false) {
    return { error: 'not_admin' }
  }

  const player = new Player(playerName)

  const currentCoin = await player.giveCoin(amount)

  return { data: currentCoin }
}

export default giveCoin
