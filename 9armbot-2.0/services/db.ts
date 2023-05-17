import { Player } from '@prisma/client'
import prisma from '../../prisma/client'

export interface DbInterface {
  connect(): Promise<void>
  disconnect(): Promise<void>
  createPlayer(username: string): Promise<Player>
  getPlayerbyUsername(username: string): Promise<Player | null>
}

export class Db implements DbInterface {
  public async connect() {
    await prisma.$connect()
    console.log('Database disconnected.')
  }

  public async disconnect() {
    await prisma.$disconnect()
    console.log('Database disconnected.')
  }

  // Deprecated : Should only be used in tests
  public async read() {
    return {
      players: await prisma.player.findMany(),
    }
  }

  public async createPlayer(username: string) {
    const player = await this.getPlayerbyUsername(username)

    if (player) {
      return player
    }

    const newPlayer = await prisma.player.create({
      data: {
        username: username.toLowerCase(),
      },
    })

    return newPlayer
  }

  public async updatePlayer(username: string, data: Partial<Player>) {
    let player = await this.getPlayerbyUsername(username)

    if (!player) {
      throw new Error(`Player ${username} not found!`)
    }

    player = await prisma.player.update({
      where: {
        username: username.toLowerCase(),
      },
      data: {
        status: data.status,
        coins: data.coins,
        roll_counter: data.roll_counter,
        twitch_id: data.twitch_id,
        discord_id: data.discord_id,
        is_admin: data.is_admin,
      },
    })

    return player
  }

  public async getPlayerbyUsername(username: string) {
    return await prisma.player.findFirst({
      where: { username: username.toLowerCase() },
    })
  }
}
