import find from 'lodash/find'
import fs from 'fs'
import { nanoid } from 'nanoid'

export interface IDb {
  players: IPlayer[]
}

export interface IPlayer {
  uid: string
  username: string
}

export class Db {
  private db: IDb = {
    players: [],
  }

  public load() {
    try {
      const playersJson = fs.readFileSync('./players.json', 'utf8')
      this.db = JSON.parse(playersJson)
    } catch (err) {
      console.log('File not found, use default blank db.', err.message)
    }
  }

  public read() {
    return this.db
  }

  public createPlayer(username: string) {
    // Don't re-create existing player
    const player = find(this.db.players, (p) => {
      return p.username === username
    })

    if (player) {
      return player
    }

    const newPlayer = {
      uid: nanoid(),
      username,
    }

    this.db.players.push(newPlayer)

    return newPlayer
  }

  public getPlayerbyUsername(username: string) {
    return find(this.db.players, (p) => {
      return p.username === username
    })
  }
}

// Use singleton pattern to mitigate multiple readers/writers
export const dbService = new Db()
