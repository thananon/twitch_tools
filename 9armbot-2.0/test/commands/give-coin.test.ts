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
    it('gives 10 coins to player by default', async () => {

      await prisma.player.create({
        data: {
          username: 'bar',
          coins: 5,
        },
      })

      const result = await commands.giveCoin('bar')
      let player = await Player.withUsername('bar')

      expect(result).toEqual({ data: 10 + 5 })
      expect(await player.coins()).toEqual(15)
   })
})
