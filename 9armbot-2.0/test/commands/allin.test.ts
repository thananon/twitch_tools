import commands from '../../services/bot'
import prisma from '../../../prisma/client'

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

describe('allin', () => {
  it('exists', () => {
    expect(commands.allin).toBeDefined()
  })

  describe('no coin', () => {
    beforeEach(async () => {
      await prisma.player.update({
        where: { username },
        data: {
          coins: 0,
        },
      })
    })

    it('returns not_enough_coin error', async () => {
      const result = await commands.allin(username)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          error: 'not_enough_coin',
        }),
      )

      // Check db
      const player = await prisma.player.findFirst({ where: { username } })
      expect(player!.coins).toEqual(0)
    })
  })

  describe('losing', () => {
    it('deducts all coins from player', async () => {
      const result = await commands.allin(username)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          data: {
            state: 'lose',
            bet: 10,
            win: 0,
            balance: 0,
          },
        }),
      )

      // Check db
      const player = await prisma.player.findFirst({ where: { username } })
      expect(player!.coins).toEqual(0)
    })
  })

  describe('winning', () => {
    beforeEach(async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0)
    })

    it('win big amount of coin (TODO)', async () => {
      const result = await commands.allin(username)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          data: {
            state: 'win',
            bet: 10,
            win: 50,
            balance: 50,
          },
        }),
      )

      // Check db
      const player = await prisma.player.findFirst({ where: { username } })
      expect(player!.coins).toEqual(50)
    })
  })

  describe('winning jackpot', () => {})
})
