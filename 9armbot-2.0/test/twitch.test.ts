import tmi from 'tmi.js'
import { client, mockMessage } from '../../__mocks__/tmi.js'
import { twitchService } from '../services/twitch'
import prisma from '../../prisma/client'

jest.mock('tmi.js')

beforeAll(() => {
  jest.clearAllMocks()
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
  await twitchService()

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
    it('returns 0 armcoins if player not existed', async () => {
      await mockMessage({
        channel: '#9armbot',
        message: '!coin',
        tags: {
          username: 'armzi',
        },
      })

      expect(client.say).toBeCalledWith('#9armbot', `@armzi มี 0 armcoin.`)
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

      expect(client.say).toBeCalledWith('#9armbot', `@armzi มี 7 armcoin.`)
    })
  })

  describe('!draw', () => {
    it('does something', () => {})
  })

  describe('!give', () => {
    it('does something', () => {})
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

describe('on subscription event', () => {})

describe('on resub event', () => {})

describe('on subgift event', () => {})

describe('on submysterygift event', () => {})

describe('on cheer event', () => {})

describe('on connected event', () => {})
