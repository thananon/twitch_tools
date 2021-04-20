import { Db } from './db'

const db = new Db()

interface Result {
  error?: string
  data?: number
}

interface ErrorResult extends Result {
  error: string
}

interface CoinResult extends Result {
  data: number
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
}

export default commands
