import prisma from '../../prisma/client'

const SYNC_INTERVAL = 10000

export default class Setting {
  private data: Record<string, string | boolean | number> = {}
  private log: boolean

  private constructor() {}

  public static async init() {
    const setting = new Setting()

    await setting.setup()

    return setting
  }

  async setup() {
    const marketState = await prisma.setting.upsert({
      where: { name: 'market_state' },
      create: {
        name: 'market_state',
        data_type: 'string',
        data: 'close',
        description: 'สถานะตลาด (open/close)',
      },
      update: {},
    })

    const gachaRate = await prisma.setting.upsert({
      where: { name: 'gacha_rate' },
      create: {
        name: 'gacha_rate',
        data_type: 'number',
        data: '0.4',
        description: 'เรทกาชา (0 - 1)',
      },
      update: {},
    })

    this.data.marketState = marketState.data
    this.data.gachaRate = Number(gachaRate.data)
  }

  startAutoSync(log = true) {
    this.log = log

    setInterval(() => {
      this.sync()
    }, SYNC_INTERVAL)
  }

  async sync() {
    const marketState = await prisma.setting.findFirst({
      where: { name: 'market_state' },
    })
    const gachaRate = await prisma.setting.findFirst({
      where: { name: 'gacha_rate' },
    })

    this.data.marketState = marketState!.data
    this.data.gachaRate = Number(gachaRate!.data)

    if (this.log) {
      console.log('Synchronized Settings', { data: this.data })
    }
  }

  get marketState() {
    return this.data.marketState as 'open' | 'close'
  }

  async setMarketState(state: 'open' | 'close') {
    this.data.marketState = state

    await prisma.setting.update({
      where: { name: 'market_state' },
      data: { data: this.data.marketState.toString() },
    })
  }

  get gachaRate(): number {
    return this.data.gachaRate as number
  }

  async setGachaRate(rate: number | string) {
    this.data.gachaRate = Number(rate)

    await prisma.setting.update({
      where: { name: 'gacha_rate' },
      data: { data: this.data.gachaRate.toString() },
    })
  }
}
