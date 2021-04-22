import { Db } from '../db'
import { Player as PrismaPlayer } from '@prisma/client'

const db = new Db()

// TODO: Add tests
class Player {
  username: string
  info: PrismaPlayer

  constructor(username: string) {
    this.username = username
    this.readInfo()
  }

  async readInfo(): Promise<PrismaPlayer> {
    let info = await db.getPlayerbyUsername(this.username)
    if (info) {
      this.info = info
    } else {
      this.info = await db.createPlayer(this.username)
    }

    return this.info
  }

  async coins() {
    await this.readInfo()
    return this.info.coins
  }

  async giveCoin(amount: number) {
    const currentCoins = await this.coins()
    await db.updatePlayer(this.username, { coins: currentCoins + amount })
  }

  /* Try to deduct player's coin with amount given.
   * return true if succeed. */
  async deductCoin(amount: number) {
    const currentCoins = await this.coins()

    if (currentCoins >= amount) {
      await db.updatePlayer(this.username, { coins: currentCoins - amount })
      return true
    } else {
      return false
    }
  }
}

export default Player
