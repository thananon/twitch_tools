import fs from 'fs'
import { Db, IDb } from '../services/db'

jest.mock('fs')

const mockFs = fs as jest.Mocked<typeof fs>

let db: Db

beforeEach(() => {
  db = new Db()
})

describe('Database', () => {
  describe('#load', () => {
    it('loads data from json file and initiate players', () => {
      const dbFileContent: IDb = {
        players: [
          {
            uid: 'uid',
            username: 'foo',
          },
        ],
      }

      mockFs.readFileSync.mockReturnValueOnce(JSON.stringify(dbFileContent))

      db.load()

      expect(db.read()).toEqual(dbFileContent)
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1)
    })

    it('falls back to default if file does not exist', () => {
      const dbFileBlank: IDb = {
        players: [],
      }

      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory')
      })

      expect(db.read()).toEqual(dbFileBlank)
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1)
    })
  })

  describe('#save', () => {
    it('saves the current database state to json file', () => {
      db.createPlayer('foo')

      const expectedJson = JSON.stringify(db.read(), null, 2)

      db.save()

      expect(mockFs.writeFileSync).toHaveBeenCalledTimes(1)
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expectedJson,
        'utf8',
      )
    })
  })
})

describe('CRUD players', () => {
  describe('#createPlayer', () => {
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

  describe('#getPlayerbyUsername', () => {
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
