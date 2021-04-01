import { Db } from '../services/db'

let db: Db

beforeEach(() => {
  db = new Db()
})

describe('read db', () => {
  describe('when db is not existed yet', () => {
    it('returns default data', () => {
      expect(db.read()).toEqual({
        players: [],
      })
    })
  })
})

describe('CRUD players', () => {
  describe('createPlayer', () => {
    it('can create new player by username (twitch for now)', () => {
      db.createPlayer('foo')

      expect(db.read()).toEqual({
        players: [
          {
            uid: expect.any(String),
            username: 'foo',
          },
        ],
      })
    })

    it('does not create new player if username is existed', () => {
      db.createPlayer('foo')
      db.createPlayer('foo')
      db.createPlayer('foo')

      expect(db.read()).toEqual({
        players: [
          {
            uid: expect.any(String),
            username: 'foo',
          },
        ],
      })
    })
  })

  describe('getPlayerbyUsername', () => {
    it('returns undefined if player is not found', () => {
      expect(db.getPlayerbyUsername('foo')).toBeUndefined
    })

    it('returns player if found by username', () => {
      db.createPlayer('foo')

      expect(db.getPlayerbyUsername('foo')).toEqual({
        uid: expect.any(String),
        username: 'foo',
      })

      expect(db.getPlayerbyUsername('bar')).toBeUndefined
    })
  })
})
