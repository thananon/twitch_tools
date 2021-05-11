const mockFeed = jest.fn()
jest.mock('../services/widget', () => {
  return jest.fn().mockImplementation(() => {
    return { feed: mockFeed }
  })
})

import tmi from 'tmi.js'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

import { client, mockMessage } from '../../__mocks__/tmi.js'
import { subscriptionPayout, twitchService } from '../services/twitch'
import prisma from '../../prisma/client'
import commands from '../services/bot'
import Setting from '../services/setting'

jest.mock('tmi.js')

beforeAll(async () => {
  jest.clearAllMocks()
  await twitchService()
})

beforeEach(async () => {
  await prisma.player.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

// Tmi has no type for events :cry:
const exampleMessage = {
  channel: '#9armbot',
  tags: {
    'badge-info': null,
    badges: { broadcaster: '1' },
    'client-nonce': 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    color: null,
    'display-name': '9arm',
    emotes: null,
    flags: null,
    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxx',
    mod: false,
    'room-id': '12345678',
    subscriber: false,
    'tmi-sent-ts': '1617468766367',
    turbo: false,
    'user-id': '12345678',
    'user-type': null,
    'emotes-raw': null,
    'badge-info-raw': null,
    'badges-raw': 'broadcaster/1',
    username: '9arm',
    'message-type': 'chat',
  },
  message: 'Hello',
  self: false,
}

it('connects with twitch via tmi', async () => {
  expect(tmi.Client).toBeCalledTimes(1)

  await mockMessage(exampleMessage)

  expect(client.on).toBeCalledWith('message', expect.any(Function))
})

describe('on message event', () => {
  describe('!github', () => {
    it('makes the bot say repo url to channel', async () => {
      await mockMessage({
        channel: '#9armbot',
        message: '!github',
      })

      expect(client.say).toBeCalledWith(
        '#9armbot',
        'https://github.com/thananon/twitch_tools',
      )
    })
  })

  describe('!allin', () => {
    it('does something', () => {})
  })

  describe('!auction', () => {
    it('does something', () => {})
  })

  describe('!botstat', () => {
    it('does something', () => {})
  })

  describe('!coin', () => {
    beforeEach(() => {
      jest.spyOn(commands, 'coin')
    })

    it('returns 0 ArmCoins if player not existed', async () => {
      await mockMessage({
        channel: '#9armbot',
        message: '!coin',
        tags: {
          username: 'armzi',
        },
      })

      expect(commands.coin).toHaveBeenCalledWith('armzi')
      expect(client.say).toBeCalledWith('#9armbot', `@armzi มี 0 ArmCoin.`)
    })

    it("returns player's coin amount", async () => {
      const username = 'armzi'
      await prisma.player.create({
        data: {
          username,
          coins: 7,
        },
      })

      await mockMessage({
        channel: '#9armbot',
        message: '!coin',
        tags: {
          username: 'armzi',
        },
      })

      expect(commands.coin).toHaveBeenCalledWith('armzi')
      expect(client.say).toBeCalledWith('#9armbot', `@armzi มี 7 ArmCoin.`)
    })
  })

  describe('!gacha', () => {
    beforeEach(() => {
      jest.spyOn(commands, 'gacha').mockResolvedValue({
        data: { state: 'win', bet: 1, win: 2, balance: 3 },
      })
    })

    afterEach(() => {
      ;(
        commands.gacha as jest.MockedFunction<typeof commands.gacha>
      ).mockReset()
    })

    it('calls gacha command with amount extracted from message', async () => {
      await mockMessage({
        channel: '#9armbot',
        message: '!gacha',
        tags: {
          username: 'armzi',
        },
      })

      expect(commands.gacha).toBeCalledTimes(1)
      expect(commands.gacha).toBeCalledWith('armzi', undefined)
    })

    it('calls gacha command with specified amount casted to integer', async () => {
      await mockMessage({
        channel: '#9armbot',
        message: '!gacha 3',
        tags: {
          username: 'armzi',
        },
      })

      expect(commands.gacha).toBeCalledTimes(1)
      expect(commands.gacha).toBeCalledWith('armzi', 3)

      await mockMessage({
        channel: '#9armbot',
        message: '!gacha 123.45',
        tags: {
          username: 'armzi',
        },
      })

      expect(commands.gacha).toBeCalledTimes(2)
      expect(commands.gacha).toBeCalledWith('armzi', 123)
    })
  })

  describe('!draw', () => {
    it('does something', () => {})
  })

  describe('!give', () => {
    beforeEach(() => {
      jest.spyOn(commands, 'giveCoin').mockResolvedValue({
        data: 10,
      })
    })

    afterEach(() => {
      ;(
        commands.giveCoin as jest.MockedFunction<typeof commands.giveCoin>
      ).mockReset()
    })

    it('sends give command with username and coin amount', async () => {
      await mockMessage({
        channel: '#9armbot',
        message: '!give foo 10',
        tags: {
          username: 'armzi',
        },
      })

      expect(commands.giveCoin).toBeCalledTimes(1)
      expect(commands.giveCoin).toBeCalledWith('foo', 10)
    })
  })

  describe('!income', () => {
    it('does something', () => {})
  })

  describe('!kick', () => {
    it('does something', () => {})
  })

  describe('!load', () => {
    it('does something', () => {})
  })

  describe('!market', () => {
    it('!market open : opens the market', async () => {
      const setting = await Setting.init()
      await setting.setMarketState('close')

      expect(setting.marketState).toEqual('close')

      await mockMessage({
        channel: '#9armbot',
        message: '!market open',
        tags: {
          username: 'armzi',
        },
      })

      await setting.sync()

      expect(setting.marketState).toEqual('open')
    })

    it('!market close : closes the market', async () => {
      const setting = await Setting.init()
      await setting.setMarketState('open')

      expect(setting.marketState).toEqual('open')

      await mockMessage({
        channel: '#9armbot',
        message: '!market close',
        tags: {
          username: 'armzi',
        },
      })

      await setting.sync()

      expect(setting.marketState).toEqual('close')
    })
  })

  describe('!payday', () => {
    it('does something', () => {})
  })

  describe('!raffle', () => {
    it('does something', () => {})
  })

  describe('!reset', () => {
    it('does something', () => {})
  })

  describe('!save', () => {
    it('does something', () => {})
  })

  describe('!sentry', () => {
    it('does something', () => {})
  })

  describe('!thanos', () => {
    it('does something', () => {})
  })

  describe('!time', () => {
    it('does something', () => {})
  })
})

describe('on subscription event', () => {
  describe('#subscriptionPayout function', () => {
    beforeEach(() => {
      // Mock Twitch chatters API
      const mock = new MockAdapter(axios)
      const url = `${process.env.twitch_api}/group/user/${process.env.tmi_channel_name}/chatters`
      mock.onGet(url).reply(200, {
        chatter_count: 3,
        chatters: {
          viewers: ['foo'],
          moderators: ['bar'],
          vips: ['baz'],
        },
      })

      mockFeed.mockClear()
    })

    it('gives 10 coins to subscriber & 1 coin to 3 viewers', async () => {
      const username = 'foo'
      const total = 3

      await subscriptionPayout(username)

      expect(mockFeed).toHaveBeenCalledTimes(2)
      expect(mockFeed).toHaveBeenNthCalledWith(
        1,
        `<b class="badge bg-primary">${username}</b> ได้รับ <i class="fas fa-coins"></i> 10 ArmCoin จากการ Subscribe`,
      )
      expect(mockFeed).toHaveBeenNthCalledWith(
        2,
        `<i class="fas fa-gift"></i> สมาชิก <b class="badge bg-info">${total}</b> คนได้รับ 1 ArmCoin <i class="fas fa-coins"></i> จากการ Subscribe ของ <b class="badge bg-primary">${username}</b>`,
      )
    })
  })
})

describe('on resub event', () => {})

describe('on subgift event', () => {})

describe('on submysterygift event', () => {})

describe('on cheer event', () => {})

describe('on connected event', () => {})
