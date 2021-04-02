import { Player } from '@prisma/client'
import prisma from '../../prisma/client'

export interface IDb {
  players: Player[]
}

export interface IPlayer {
  id: Number
  username: string
}

export class Db {
  public async connect(): Promise<void> {
    await prisma.$connect()
    console.log('Database disconnected.')
  }

  public async disconnect(): Promise<void> {
    await prisma.$disconnect()
    console.log('Database disconnected.')
  }

  public async read() {
    return {
      players: await prisma.player.findMany(),
    }
  }

  public async createPlayer(username: string): Promise<Player> {
    // Don't re-create existing player
    const player = await this.getPlayerbyUsername(username)

    if (player) {
      return player
    }

    const newPlayer = await prisma.player.create({
      data: {
        username,
      },
    })

    return newPlayer
  }

  public async getPlayerbyUsername(username: string) {
    return await prisma.player.findFirst({
      where: { username },
    })
  }
}
