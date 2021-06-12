import commands from '../../services/bot'
import prisma from '../../../prisma/client'
import setting from '../../services/setting'

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

  await setting.setGachaRate('0.4')
  await setting.setJackpotRate('0.01')
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

    describe('considers gachaRate (lose)', () => {
      beforeEach(async () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.5)

        await setting.setGachaRate('0.3')
        await setting.setJackpotRate('0.2')
      })

      it('loses', async () => {
        const result = await commands.gacha(username, 3)

        // Check result
        expect(result).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              state: 'lose',
            }),
          }),
        )
      })
    })
  })

  describe('winning', () => {
    beforeEach(async () => {
      jest.spyOn(global.Math, 'random').mockReturnValue(0.05)
    })

    it('win big amount of coin', async () => {
      const result = await commands.allin(username)

      // Check result
      expect(result).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            state: 'win',
            bet: 10,
            win: 44,
            balance: 44,
          }),
        }),
      )

      // Check db
      const player = await prisma.player.findFirst({ where: { username } })
      expect(player!.coins).toEqual(44)
    })

    describe('considers gachaRate (win)', () => {
      beforeEach(async () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.3)

        await setting.setGachaRate('0.5')
        await setting.setJackpotRate('0.2')
      })

      it('wins', async () => {
        const result = await commands.gacha(username, 3)

        // Check result
        expect(result).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              state: 'win',
            }),
          }),
        )
      })
    })

    describe('considers jackpotRate (win)', () => {
      beforeEach(async () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.2)

        await setting.setGachaRate('0.5')
        await setting.setJackpotRate('0.3')
      })

      it('wins jackpot', async () => {
        const result = await commands.allin(username)

        // Check result
        expect(result).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              state: 'win_jackpot',
            }),
          }),
        )
      })
    })
  })
})
