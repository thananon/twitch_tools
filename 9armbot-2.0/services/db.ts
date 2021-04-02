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
