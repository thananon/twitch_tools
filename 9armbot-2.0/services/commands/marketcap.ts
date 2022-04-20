import { DataResult } from '../bot'
import prisma from '../../../prisma/client'

const CACHE_TTL = 60 * 1000

export interface MarketcapResult extends DataResult {
  data: {
    coins: number
    baht: number
  }
}

interface IMemory {
  cache: MarketcapResult | null
  fetchDate: Date
}

let memory: IMemory = { fetchDate: new Date(0), cache: null }

function cacheExpired() {
  return memory.fetchDate.getTime() + CACHE_TTL < new Date().getTime()
}

async function marketcap(): Promise<MarketcapResult> {
  if (!memory.cache || cacheExpired()) {
    console.log('expired - fetching new data')
    const coins = (await prisma.player.aggregate({ sum: { coins: true } })).sum
      .coins as number
    memory.cache = { data: { coins, baht: coins * 3000 } }
    memory.fetchDate = new Date()
  } else {
    console.log('cache hit')
  }

  return memory.cache
}

export default marketcap
