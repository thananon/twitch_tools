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
    it('can create new player by username (twitch for now)', async () => {
      await db.createPlayer('foo')

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
      await db.createPlayer('foo')
      await db.createPlayer('foo')
      await db.createPlayer('foo')

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

      expect(await db.getPlayerbyUsername('foo')).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          username: 'foo',
        }),
      )

      expect(await db.getPlayerbyUsername('bar')).toBeUndefined
    })
  })
})
