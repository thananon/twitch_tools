import { DataResult } from '../bot'
import Player from '../models/player'

export interface GiveCoinResult extends DataResult {
  data: number
}

async function giveCoin(
  toUsername: string,
  amount = 10,
): Promise<GiveCoinResult> {
  const player = await Player.withUsername(toUsername)
  const currentCoin = await player.giveCoin(amount)
  return { data: currentCoin }
}

async function giveCoinToList (
  giveoutList: Array<string>,
  amount: number = 1
): Promise<GiveCoinResult> {
  giveoutList.forEach(async function(toUsername) {
    await giveCoin(toUsername, amount)
  })
  return {data: giveoutList.length} // TODO: have different return code
}

export { giveCoin, giveCoinToList }
