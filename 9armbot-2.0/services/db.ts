import find from 'lodash/find'
import fs from 'fs'
import { nanoid } from 'nanoid'
import path from 'path'

const DB_PATH = path.resolve(process.cwd(), './players-2.0.json')
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

  public load(): void {
    try {
      const playersJson = fs.readFileSync(DB_PATH, 'utf8')
      this.db = JSON.parse(playersJson)
      console.log(`Loaded ${this.db.players.length} players from ${DB_PATH}.`)
    } catch (err) {
      console.log('[ERROR] File not found, use default blank db.', err.message)
    }
  }

  public save(): void {
    try {
      const data = JSON.stringify(this.read(), null, 2)
      fs.writeFileSync(DB_PATH, data, 'utf8')
      console.log(`Saved ${this.db.players.length} players to ${DB_PATH}.`)
    } catch (err) {
      console.log('[ERROR] Cannot write file.', err.message)
    }
  }

  public read(): IDb {
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

// Graceful Shutdown
function gracefulShutdown() {
  console.log('\nPre-Close')
  dbService.save()
  setTimeout(() => {
    console.log('Closed')
    process.exit(0)
  }, 1000)
}
process.on('SIGINT', () => gracefulShutdown())
process.on('SIGTERM', () => gracefulShutdown())
process.on('uncaughtException', (err) => {
  console.error(err)
  gracefulShutdown()
})

// Use singleton pattern to mitigate multiple readers/writers
export const dbService = new Db()
