import { ErrorResult, DataResult, isError } from '../bot'
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

async function giveCoinToList (
  fromUsername: string,
  giveoutList: Array<string>,
  amount: number = 1
): Promise<GiveCoinResult | ErrorResult> {
  giveoutList.forEach(async function(toUsername) {
    let e = await giveCoin(fromUsername, toUsername, amount)
    if (isError(e)) console.log(e)
    console.log(`give ${toUsername} ${amount} armcoins.`)
  })
  return {data: giveoutList.length} // TODO: have different return code
}

export { giveCoin, giveCoinToList }
