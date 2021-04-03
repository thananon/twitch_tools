import Discord from 'discord.js'
import { channel, client, mockMessage } from '../../__mocks__/discord.js'
import { discordService } from '../services/discord'

jest.mock('discord.js')

beforeAll(() => {
  jest.clearAllMocks()
})

const exampleMessage = {
  content: 'Hello',
  channelID: '111111111111111111',
  deleted: false,
  id: '000000000000000000',
  type: 'DEFAULT',
  system: false,
  authorID: '222222222222222222',
  pinned: false,
  tts: false,
  nonce: '827996914539560960',
  embeds: [],
  attachments: [],
  createdTimestamp: 1617480248237,
  editedTimestamp: 0,
  webhookID: null,
  applicationID: null,
  activity: null,
  flags: 0,
  reference: null,
  guildID: '827022686298570792',
  cleanContent: '!github',
  channel: {
    name: 'general',
    type: 'text',
    deleted: false,
    id: '111111111111111111',
    rawPosition: 0,
    parentID: '827022686298570793',
    permissionOverwrites: [],
    topic: null,
    lastMessageID: '827997460705574955',
    rateLimitPerUser: 0,
    lastPinTimestamp: null,
    guild: '827022686298570792',
    messages: ['827997460705574955'],
    nsfw: false,
    createdTimestamp: 1617247973752,
  },
  author: {
    id: '222222222222222222',
    system: null,
    locale: null,
    flags: 0,
    username: '9arm',
    bot: false,
    discriminator: '5555',
    avatar: 'e7c58499dc3ccd8582d1bbc3c89bacde',
    lastMessageChannelID: '111111111111111111',
    createdTimestamp: 1445309691967,
    defaultAvatarURL: 'https://cdn.discordapp.com/embed/avatars/1.png',
    tag: '9arm#5555',
    avatarURL:
      'https://cdn.discordapp.com/avatars/111111111111111111/e7c58499dc3ccd8582d1bbc3c89bacde.webp',
    displayAvatarURL:
      'https://cdn.discordapp.com/avatars/111111111111111111/e7c58499dc3ccd8582d1bbc3c89bacde.webp',
  },
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
