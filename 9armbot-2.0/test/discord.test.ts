import Discord from 'discord.js'
import { channel, client, mockMessage } from '../../__mocks__/discord.js'
import { discordService } from '../services/discord'

jest.mock('discord.js')

beforeAll(() => {
  jest.clearAllMocks()
})

const exampleMessage = {
  channel: { todo: 'todo' },
  author: { todo: 'todo' },
  content: 'Hello',
}

it('connects with discord', async () => {
  await discordService()

  expect(Discord.Client).toBeCalledTimes(1)

  mockMessage(exampleMessage)

  expect(client.on).toBeCalledWith('message', expect.any(Function))
})

describe('on message event', () => {
  describe('!github', () => {
    it('makes the bot say repo url to channel', () => {
      mockMessage({
        channel: {},
        author: {},
        content: '!github',
      })

      expect(channel.send).toBeCalledWith(
        'https://github.com/thananon/twitch_tools',
      )
    })
  })

  describe('!command', () => {
    it('does something', () => {})
  })

  describe('!coin', () => {
    it('does something', () => {})
  })

  describe('!leader', () => {
    it('does something', () => {})
  })
})
