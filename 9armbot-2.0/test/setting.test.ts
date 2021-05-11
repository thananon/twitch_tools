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
