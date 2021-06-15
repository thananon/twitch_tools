import prisma from '../../prisma/client'

const SYNC_INTERVAL = 10000

class Setting {
  private data: Record<string, string | boolean | number> = {}
  private log: boolean

  async init() {
    await this.setup()
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

    const raffleState = await prisma.setting.upsert({
      where: { name: 'raffle_state' },
      create: {
        name: 'raffle_state',
        data_type: 'string',
        data: 'close',
        description: 'สถานะการจับฉลาก (open/close)',
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
    this.data.raffleState = raffleState.data
    this.data.gachaRate = Number(gachaRate.data)
    this.data.jackpotRate = Number(jackpotRate.data)
  }

  startAutoSync(log = true) {
    if (process.env.NODE_ENV === 'test') {
      console.log('Autosync mode is disabled in testing.')
      return
    }

    this.log = log

    setInterval(() => {
      this.sync()
      console.log('Settings synced')
    }, SYNC_INTERVAL)
  }

  async sync() {
    const marketState = await prisma.setting.findFirst({
      where: { name: 'market_state' },
    })
    const raffleState = await prisma.setting.findFirst({
      where: { name: 'raffle_state' },
    })
    const gachaRate = await prisma.setting.findFirst({
      where: { name: 'gacha_rate' },
    })
    const jackpotRate = await prisma.setting.findFirst({
      where: { name: 'jackpot_rate' },
    })

    this.data.marketState = marketState!.data
    this.data.raffleState = raffleState!.data
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

  get raffleState() {
    return this.data.raffleState as 'open' | 'close'
  }

  async setRaffleState(state: 'open' | 'close') {
    this.data.raffleState = state

    await prisma.setting.update({
      where: { name: 'raffle_state' },
      data: { data: this.data.raffleState.toString() },
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

const setting = new Setting()

if (process.env.NODE_ENV != 'test') {
  console.log('Setting initialized')
}

export default setting
