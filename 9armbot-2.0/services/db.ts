import find from 'lodash/find'

interface IDb {
  players: IPlayer[]
}

interface IPlayer {
  uid: string
  username: string
}

export class Db {
  // TODO: Fetch from json file instead
  private db: IDb = {
    players: [],
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
      uid: 'Changeme',
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
