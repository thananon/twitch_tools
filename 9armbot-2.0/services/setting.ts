import prisma from '../../prisma/client'

const SYNC_INTERVAL = 10000

/**
 * Setting
 *   A class to initialize bot settings & sync across processes
 * Usage :
 *   1. Initialize new setting
 *     setting = new Setting()
 *   2. Wait for setup
 *     await setting.onReady()
 *       OR
 *     setting.onReady(callback)
 *   3. Get the data
 *     setting.gachaRate
 *   4. Set the data & save in database
 *     await setting.setGachaRate(newRate)
 */
export class Setting {
  private data: Record<string, string | boolean | number> = {}
  private log: boolean
  private onReadyCallbacks: Array<Function> = []

  constructor() {
    this.setup().then(() => {
      this.onReadyCallbacks.map((cb) => cb())
    })
  }

  async onReady(callback?: (_: Setting) => void): Promise<Setting> {
    return new Promise((resolve) => {
      const cb = () => {
        callback ? callback(this) : resolve(this)
      }

      this.onReadyCallbacks.push(cb)
    })
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

    const jackpotRate = await prisma.setting.upsert({
      where: { name: 'jackpot_rate' },
      create: {
        name: 'jackpot_rate',
        data_type: 'number',
        data: '0.01',
        description: 'เรทกาชา Jackpot (0 - 1)',
      },
      update: {},
    })

    this.data.marketState = marketState.data
    this.data.gachaRate = Number(gachaRate.data)
    this.data.jackpotRate = Number(jackpotRate.data)
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
    const jackpotRate = await prisma.setting.findFirst({
      where: { name: 'jackpot_rate' },
    })

    this.data.marketState = marketState!.data
    this.data.gachaRate = Number(gachaRate!.data)
    this.data.jackpotRate = Number(jackpotRate!.data)

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

  get jackpotRate(): number {
    return this.data.jackpotRate as number
  }

  async setJackpotRate(rate: number | string) {
    this.data.jackpotRate = Number(rate)

    await prisma.setting.update({
      where: { name: 'jackpot_rate' },
      data: { data: this.data.jackpotRate.toString() },
    })
  }
}

let sharedSetting = new Setting()

export default sharedSetting
