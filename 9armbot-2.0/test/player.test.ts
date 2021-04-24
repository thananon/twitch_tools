import Player from '../services/models/player'
import prisma from '../../prisma/client'

beforeEach(async () => {
  // Cleanup players each test
  await prisma.player.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Player', () => {
  it('initializes with username', async () => {
    const player = new Player('foo')

    expect(player).toBeInstanceOf(Player)
  })

  describe('.withUsername', () => {
    it('initializes with username, and read info', async () => {
      const player = await Player.withUsername('foo')

      expect(player).toBeInstanceOf(Player)

      expect(player.info).toBeDefined()
    })
  })

  describe('#readInfo', () => {
    it('initialize new user', async () => {
      const player = new Player('foo')

      expect(player.info).toBeUndefined()

      await player.readInfo()

      expect(player.info.coins).toEqual(0)
      expect(player.info.username).toEqual('foo')
    })

    it('loads user if already exist', async () => {
      await prisma.player.create({ data: { username: 'foo', coins: 10 } })

      const player = new Player('foo')

      await player.readInfo()

      expect(player.info.coins).toEqual(10)
      expect(player.info.username).toEqual('foo')
    })
  })

  describe('#coins', () => {
    it('returns player current coin amount', async () => {
      await prisma.player.create({ data: { username: 'foo', coins: 10 } })

      const player = new Player('foo')

      expect(await player.coins()).toEqual(10)
    })
  })

  describe('#giveCoin', () => {
    it('increases coin amount for player and return balance', async () => {
      await prisma.player.create({ data: { username: 'foo', coins: 10 } })

      const player = new Player('foo')

      expect(await player.giveCoin(5)).toEqual(15)

      expect(await player.coins()).toEqual(15)
    })
  })

  describe('#deductCoin', () => {
    it('decreases coin amount for player and return true', async () => {
      await prisma.player.create({ data: { username: 'foo', coins: 10 } })

      const player = new Player('foo')

      expect(await player.deductCoin(3)).toEqual(true)

      expect(await player.coins()).toEqual(7)
    })

    it('returns false if amount to deduct is more than player coin', async () => {
      await prisma.player.create({ data: { username: 'foo', coins: 10 } })

      const player = new Player('foo')

      expect(await player.deductCoin(20)).toEqual(false)

      expect(await player.coins()).toEqual(10)
    })
  })

  describe('#isAdmin', () => {
    it('returns true if player is admin', async () => {
      await prisma.player.create({ data: { username: 'foo', coins: 10 } })
      await prisma.player.create({
        data: { username: 'bar', coins: 10, is_admin: true },
      })

      const player = new Player('foo')
      const adminPlayer = new Player('bar')

      await player.readInfo()
      await adminPlayer.readInfo()

      expect(await player.isAdmin()).toBeFalsy()
      expect(await adminPlayer.isAdmin()).toBeTruthy()
    })
  })
})
