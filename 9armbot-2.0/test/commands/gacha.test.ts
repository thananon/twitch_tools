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

describe('gacha', () => {
  it('exists', () => {
    expect(commands.gacha).toBeDefined()
  })

  describe('bad amount', () => {
    it('returns error for negative coins', async () => {
      const result = await commands.gacha(username, -1)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          error: 'input_invalid',
        }),
      )
    })

    it('returns error for NaN coins', async () => {
      const result = await commands.gacha(username, NaN)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          error: 'input_invalid',
        }),
      )
    })
  })

  describe('losing', () => {
    it('deducts 1 coin from player if not specify amount', async () => {
      const result = await commands.gacha(username)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          data: {
            state: 'lose',
            bet: 1,
            win: 0,
            balance: 9,
          },
        }),
      )

      // Check db
      const player = await prisma.player.findFirst({ where: { username } })
      expect(player!.coins).toEqual(9)
    })

    it('deducts x coins from player', async () => {
      const amount = 3
      const result = await commands.gacha(username, amount)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          data: {
            state: 'lose',
            bet: 3,
            win: 0,
            balance: 7,
          },
        }),
      )

      // Check db
      const player = await prisma.player.findFirst({ where: { username } })
      expect(player!.coins).toEqual(10 - 3)
    })
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

    it('returns not_enough_coin error (1 coin)', async () => {
      const result = await commands.gacha(username)

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

  describe('not enough coins', () => {
    it('returns not_enough_coin error (gacha 11 but have 10 coins)', async () => {
      const result = await commands.gacha(username, 11)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          error: 'not_enough_coin',
        }),
      )

      // Check db
      const player = await prisma.player.findFirst({ where: { username } })
      expect(player!.coins).toEqual(10)
    })
  })

  describe('winning', () => {
    beforeEach(async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0)
    })

    it('win same amount of coin (TODO)', async () => {
      const result = await commands.gacha(username, 3)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          data: {
            state: 'win',
            bet: 3,
            win: 6,
            balance: 13,
          },
        }),
      )

      // Check db
      const player = await prisma.player.findFirst({ where: { username } })
      expect(player!.coins).toEqual(10 + 3)
    })

    it('returns not_enough_coin error even if you are winning', async () => {
      const result = await commands.gacha(username, 11)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          error: 'not_enough_coin',
        }),
      )

      // Check db
      const player = await prisma.player.findFirst({ where: { username } })
      expect(player!.coins).toEqual(10)
    })
  })

  describe('winning jackpot', () => {})

  describe('all-in mode', () => {})
})
