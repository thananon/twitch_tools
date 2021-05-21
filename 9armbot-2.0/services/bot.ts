import { Db } from './db'
import gacha from './commands/gacha'
import { giveCoin, giveCoinToList } from './commands/give-coin'
import { allin } from './commands/allin'

const db = new Db()

export type Result = DataResult | ErrorResult

export interface DataResult {
  data: number | Record<string, unknown>
}

export interface ErrorResult {
  error: string
}

interface CoinResult extends DataResult {
  data: number
}

export function isError(result: Result): result is ErrorResult {
  return (result as ErrorResult).error !== undefined
}

export const commands = {
  coin: async (username?: string | null): Promise<CoinResult | ErrorResult> => {
    if (!username) {
      return { error: 'input_invalid' }
    }

    const player = await db.getPlayerbyUsername(username)
    if (!player) {
      return { error: 'player_not_found' }
    }

    return { data: player.coins }
  },
  gacha,
  allin,
  giveCoin,
  giveCoinToList,
}

export default commands
