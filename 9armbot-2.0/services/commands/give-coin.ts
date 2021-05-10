import { DataResult } from '../bot'
import Player from '../models/player'
import prisma from '../../../prisma/client'

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

async function giveCoinToList(
  giveoutList: Array<string>,
  amount: number = 1,
): Promise<GiveCoinResult> {
  const players = await prisma.player.updateMany({
    where: { username: { in: giveoutList.map((name) => name.toLowerCase()) } },
    data: { coins: { increment: amount } },
  })

  return { data: players.count } // TODO: have different return code
}

export { giveCoin, giveCoinToList }
