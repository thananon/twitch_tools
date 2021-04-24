import commands from '../../services/bot'
import prisma from '../../../prisma/client'
import Player from '../../services/models/player'

const username = 'foo'

beforeEach(async () => {
  jest.spyOn(global.Math, 'random').mockReturnValue(0.5)

  await prisma.player.deleteMany()

  await prisma.player.create({
    data: {
      username,
      coins: 10,
    },
  })
})

afterEach(() => {
  jest.spyOn(global.Math, 'random').mockRestore()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('giveCoin', () => {
  describe('when sender is not admin', () => {
    it('does nothing', async () => {
      const result = await commands.giveCoin('foo', 'bar')

      expect(result).toEqual({ error: 'not_admin' })
    })
  })

  describe('when sender is admin', () => {
    it('gives 10 coins to player by default', async () => {
      await prisma.player.update({
        where: { username },
        data: {
          is_admin: true,
        },
      })

      await prisma.player.create({
        data: {
          username: 'bar',
          coins: 5,
        },
      })

      const result = await commands.giveCoin('foo', 'bar')

      expect(result).toEqual({ data: 10 + 5 })

      expect(await new Player('bar').coins()).toEqual(15)
    })
  })
})
