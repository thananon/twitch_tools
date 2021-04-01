import dotenv from 'dotenv'
import { dbService } from './db'

dotenv.config()

export async function discordService() {
  // Test db reading
  setInterval(() => {
    console.log('discord read db from dbservice', dbService.read())
  }, 2500)

  setInterval(() => {
    console.log(
      'discord',
      'test adding random players',
      dbService.createPlayer(Math.random().toString()),
    )
  }, 7000)
}
