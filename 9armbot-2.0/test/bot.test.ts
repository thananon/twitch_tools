import commands from '../services/bot'
import prisma from '../../prisma/client'
import Player from '../services/models/player'

beforeEach(async () => {
  await prisma.player.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('commands', () => {
  describe('#coin', () => {
    it('exists', () => {
      expect(commands.coin).toBeDefined()
    })

    it('returns error if username is not supplied', async () => {
      const result = await commands.coin(null)

      expect(result).toEqual({ error: 'input_invalid' })
    })

    it('returns not found error if username supplied is not existed in player database', async () => {
      const result = await commands.coin('foo')

      expect(result).toEqual({ error: 'player_not_found' })
    })

    it("returns player's coin amount", async () => {
      const username = 'foo'
      await prisma.player.create({
        data: {
          username,
          coins: 7,
        },
      })

      const result = await commands.coin('foo')

      expect(result).toEqual({ data: 7 })
    })
  })
})
