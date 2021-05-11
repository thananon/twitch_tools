import prisma from '../../prisma/client'

export default class Setting {
  private data: Record<string, string | boolean | number> = {}

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

  async sync() {
    await prisma.setting.update({
      where: { name: 'market_state' },
      data: { data: this.data.marketState.toString() },
    })
  }

  get marketState() {
    return this.data.marketState as 'open' | 'close'
  }

  set marketState(state: 'open' | 'close') {
    this.data.marketState = state
  }
}
