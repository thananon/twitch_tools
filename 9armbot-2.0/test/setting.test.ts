import Setting from '../services/setting'
import prisma from '../../prisma/client'

beforeEach(async () => {
  await prisma.setting.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('#init', () => {
  it('creates default settings in database', async () => {
    await Setting.init()

    const marketState = await prisma.setting.findFirst({
      where: { name: 'market_state' },
    })

    expect(marketState).not.toBeNull()
    expect(marketState?.data).toEqual('close')
  })

  describe('marketState', () => {
    it('returns market state as close', async () => {
      const setting = await Setting.init()

      expect(setting.marketState).toEqual('close')
    })
  })

  describe('setMarketState', () => {
    it("can be changed to 'open' and update the database", async () => {
      const setting = await Setting.init()

      await setting.setMarketState('open')

      expect(setting.marketState).toEqual('open')
    })
  })

  describe('gachaRate', () => {
    it('returns as 0.4 by default', async () => {
      const setting = await Setting.init()

      expect(setting.gachaRate).toEqual(0.4)
    })
  })

  describe('setGachaRate', () => {
    it('changes the gacha rate to specified value', async () => {
      const setting = await Setting.init()

      await setting.setGachaRate(0.5)

      expect(setting.gachaRate).toEqual(0.5)
    })

    it('supports setting with string', async () => {
      const setting = await Setting.init()

      await setting.setGachaRate('0.6')

      expect(setting.gachaRate).toEqual(0.6)
    })
  })

  describe('jackpotRate', () => {
    it('returns as 0.01 by default', async () => {
      const setting = await Setting.init()

      expect(setting.jackpotRate).toEqual(0.01)
    })
  })

  describe('setJackpotRate', () => {
    it('changes the gacha rate to specified value', async () => {
      const setting = await Setting.init()

      await setting.setJackpotRate(0.05)

      expect(setting.jackpotRate).toEqual(0.05)
    })

    it('supports setting with string', async () => {
      const setting = await Setting.init()

      await setting.setJackpotRate('0.06')

      expect(setting.jackpotRate).toEqual(0.06)
    })
  })

  describe('sync', () => {
    it('loads the current database state', async () => {
      const setting = await Setting.init()

      expect(setting.marketState).toEqual('close')

      // Update database directly
      await prisma.setting.update({
        where: { name: 'market_state' },
        data: { data: 'open' },
      })

      expect(setting.marketState).toEqual('close')

      await setting.sync()

      expect(setting.marketState).toEqual('open')
    })
  })
})
