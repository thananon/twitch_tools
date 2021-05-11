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
    const record = await prisma.setting.upsert({
      where: { name: 'market_state' },
      create: {
        name: 'market_state',
        data_type: 'string',
        data: 'close',
        description: 'สถานะตลาด (open/close)',
      },
      update: {},
    })

    this.data.marketState = record.data
  }

  startAutoSync(log = true) {
    this.log = log

    setInterval(() => {
      this.sync()
    }, SYNC_INTERVAL)
  }

  async sync() {
    const record = await prisma.setting.findFirst({
      where: { name: 'market_state' },
    })

    this.data.marketState = record!.data

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
}
