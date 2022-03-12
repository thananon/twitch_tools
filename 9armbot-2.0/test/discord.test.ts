import Discord from 'discord.js'
import { channel, client, mockMessage } from '../../__mocks__/discord.js'
import { discordService } from '../services/discord'
import prisma from '../../prisma/client'
import commands from '../services/bot'

jest.mock('discord.js')

beforeEach(async () => {
  jest.clearAllMocks()
  await discordService()
})

beforeEach(async () => {
  await prisma.player.deleteMany()
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
  expect(Discord.Client).toBeCalledTimes(1)

  await mockMessage(exampleMessage)

  expect(client.on).toBeCalledWith('message', expect.any(Function))
})

describe('on message event', () => {
  describe('!github', () => {
    it('makes the bot say repo url to channel', async () => {
      await mockMessage({
        channel: {},
        author: {},
        content: '!github',
      })

      expect(channel.send).toBeCalledWith(
        'https://github.com/thananon/twitch_tools',
      )
    })
  })

  describe('!marketcap', () => {
    it('returns marketcap data', async () => {
      jest.spyOn(commands, 'marketcap').mockResolvedValue({
        data: { coins: 100, baht: 100 * 3000 },
      })

      await mockMessage({
        channel: {},
        author: {},
        content: '!marketcap',
      })

      expect(commands.marketcap).toBeCalledTimes(1)

      expect(channel.send).toBeCalledWith('Market Cap: 300000 บาท (100 $ARM)')
    })
  })

  describe('!command', () => {
    it('does something', () => {})
  })

  describe('!coin', () => {
    beforeEach(() => {
      jest.spyOn(commands, 'coin')
    })

    it('returns error if username is not supplied', async () => {
      await mockMessage({
        channel: {},
        author: {},
        content: '!coin',
      })

      expect(commands.coin).not.toHaveBeenCalled()
      expect(channel.send).toBeCalledWith(
        'ใส่ username ของ twitch สิวะ ไม่บอกแล้วจะไปรู้ได้ไงว่า id twitch เอ็งคืออะไร คิดดิคิด...',
      )
    })

    it('returns not found error if username supplied is not existed in player database', async () => {
      await mockMessage({
        channel: {},
        author: {},
        content: '!coin foo',
      })

      expect(commands.coin).toHaveBeenCalledWith('foo')
      expect(channel.send).toBeCalledWith(
        'ไม่พบ username <foo> โปรดใส่ Twitch username..',
      )
    })

    it("returns player's coin amount", async () => {
      const username = 'foo'
      await prisma.player.create({
        data: {
          username,
          coins: 7,
        },
      })

      await mockMessage({
        channel: {},
        author: {},
        content: '!coin foo',
      })

      const expectedMessage = new Discord.MessageEmbed()
        .addField(`<foo>`, `มียอดคงเหลือ 7 $ARM`)
        .setFooter(
          'Contribute @ github: https://github.com/thananon/twitch_tools',
        )

      expect(commands.coin).toHaveBeenCalledWith('foo')
      expect(channel.send).toBeCalledWith(expectedMessage)
    })

    describe('when DISCORD_WHITELIST_CHANNELS env is not empty', () => {
      beforeEach(async () => {
        process.env.DISCORD_WHITELIST_CHANNELS = 'foo_room,bar_room'
      })

      afterEach(async () => {
        process.env.DISCORD_WHITELIST_CHANNELS = ''
      })

      it('accepts only message from those channels', async () => {
        const username = 'foo'
        await prisma.player.create({
          data: {
            username,
            coins: 7,
          },
        })

        await mockMessage({
          channel: {
            type: 'text',
            name: 'foo_room',
          },
          author: {},
          content: '!coin foo',
        })

        const expectedMessage = new Discord.MessageEmbed()
          .addField(`<foo>`, `มียอดคงเหลือ 7 $ARM`)
          .setFooter(
            'Contribute @ github: https://github.com/thananon/twitch_tools',
          )

        expect(commands.coin).toHaveBeenCalledWith('foo')
        expect(channel.send).toBeCalledWith(expectedMessage)
      })

      it('does not accept if channel is not in the whitelist', async () => {
        const username = 'foo'
        await prisma.player.create({
          data: {
            username,
            coins: 7,
          },
        })

        await mockMessage({
          channel: {
            type: 'text',
            name: 'another_room',
          },
          author: {},
          content: '!coin foo',
        })

        expect(commands.coin).not.toHaveBeenCalledWith('foo')
        expect(channel.send).toBeCalledWith(
          'ไปถามในห้อง #foo_room, #bar_room หรือ dm นะจ๊ะ',
        )
      })

      it('accepts dm type message', async () => {
        const username = 'foo'
        await prisma.player.create({
          data: {
            username,
            coins: 7,
          },
        })

        await mockMessage({
          channel: {
            type: 'dm',
          },
          author: {},
          content: '!coin foo',
        })

        const expectedMessage = new Discord.MessageEmbed()
          .addField(`<foo>`, `มียอดคงเหลือ 7 $ARM`)
          .setFooter(
            'Contribute @ github: https://github.com/thananon/twitch_tools',
          )

        expect(commands.coin).toHaveBeenCalledWith('foo')
        expect(channel.send).toBeCalledWith(expectedMessage)
      })
    })
  })

  describe('!leader', () => {
    it('prints top $ARM holders', async () => {
      await prisma.player.create({
        data: {
          username: 'foo',
          coins: 7,
        },
      })
      await prisma.player.create({
        data: {
          username: 'bar',
          coins: 10,
        },
      })
      await prisma.player.create({
        data: {
          username: 'baz',
          coins: 5,
        },
      })

      await mockMessage({
        channel: {},
        author: {},
        content: '!leader',
      })

      const expectedMessage = new Discord.MessageEmbed()
        .setTitle('กลุ่มผู้นำ $ARM')
        .setDescription('นายทุนผู้ถือเหรียญดิจิทัลที่มาแรงที่สุดในขณะนี้')
        .addField(`bar`, 10, false)
        .addField(`foo`, 7, false)
        .addField(`baz`, 5, false)
        .setFooter(
          'Contribute @ github: https://github.com/thananon/twitch_tools',
        )
        .setThumbnail(
          'https://cdn.shopify.com/s/files/1/1955/3977/products/stonl_800x.png',
        )

      expect(channel.send).toBeCalledWith(expectedMessage)
    })
  })
})
