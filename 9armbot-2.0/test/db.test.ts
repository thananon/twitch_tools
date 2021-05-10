import prisma from '../../prisma/client'
import { Db } from '../services/db'

let db: Db

beforeEach(async () => {
  db = new Db()

  // Cleanup players each test
  await prisma.player.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('CRUD players', () => {
  describe('#createPlayer', () => {
    it('can create new player by lowercased username (twitch for now)', async () => {
      await db.createPlayer('FoO')

      expect(await db.read()).toEqual({
        players: [
          expect.objectContaining({
            id: expect.any(Number),
            username: 'foo',
          }),
        ],
      })
    })

    it('does not create new player if username is existed', async () => {
      await db.createPlayer('Foo')
      await db.createPlayer('fOo')
      await db.createPlayer('foO')

      expect(await db.read()).toEqual({
        players: [
          expect.objectContaining({
            id: expect.any(Number),
            username: 'foo',
          }),
        ],
      })
    })
  })

  describe('#getPlayerbyUsername', () => {
    it('returns undefined if player is not found', async () => {
      expect(await db.getPlayerbyUsername('foo')).toBeUndefined
    })

    it('returns player if found by username', async () => {
      await db.createPlayer('foo')

      expect(await db.getPlayerbyUsername('Foo')).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          username: 'foo',
        }),
      )

      expect(await db.getPlayerbyUsername('bar')).toBeUndefined
    })
  })

  describe('#updatePlayer', () => {
    it('updates player with supplied data', async () => {
      await db.createPlayer('foo')

      await db.updatePlayer('Foo', {
        username: 'DONTCHANGEME',
        status: 'online',
        coins: 10,
        roll_counter: 5,
        twitch_id: 'twitch_id_foo',
        discord_id: 'discord_id_foo',
      })

      expect(await db.getPlayerbyUsername('foo')).toEqual(
        expect.objectContaining({
          username: 'foo',
          status: 'online',
          roll_counter: 5,
          coins: 10,
          twitch_id: 'twitch_id_foo',
          discord_id: 'discord_id_foo',
        }),
      )
    })

    it('raises error if player is not found', async () => {
      await db.createPlayer('foo')

      await expect(db.updatePlayer('bar', {})).rejects.toThrowError(
        `Player bar not found!`,
      )
    })
  })
})
