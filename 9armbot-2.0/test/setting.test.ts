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

    it("can be changed to 'open' and update the database after sync", async () => {
      const setting = await Setting.init()

      setting.marketState = 'open'

      expect(setting.marketState).toEqual('open')

      const marketStateBeforeSync = await prisma.setting.findFirst({
        where: { name: 'market_state' },
      })

      expect(marketStateBeforeSync).not.toBeNull()
      expect(marketStateBeforeSync?.data).toEqual('close') // Not sync yet

      await setting.sync()

      const marketStateAfterSync = await prisma.setting.findFirst({
        where: { name: 'market_state' },
      })

      expect(marketStateAfterSync).not.toBeNull()
      expect(marketStateAfterSync?.data).toEqual('open') // Sync'ed
    })
  })
})
