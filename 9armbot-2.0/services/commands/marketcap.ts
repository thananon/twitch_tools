import { DataResult } from '../bot'
import prisma from '../../../prisma/client'

export interface MarketcapResult extends DataResult {
  data: {
    coins: number
    baht: number
  }
}

async function marketcap(): Promise<MarketcapResult> {
  const coins = (await prisma.player.aggregate({ sum: { coins: true } })).sum
    .coins as number

  return { data: { coins, baht: coins * 3000 } } as MarketcapResult
}

export default marketcap
