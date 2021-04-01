import dotenv from 'dotenv'
import { customAlphabet } from 'nanoid'
import { dbService } from './db'

dotenv.config()

export async function discordService() {
  // Test db reading
  setInterval(() => {
    console.log('discord read db from dbservice', dbService.read())
  }, 2500)

  // Test db writing
  const randomName = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8)

  setInterval(() => {
    console.log(
      'discord',
      'test adding random players',
      dbService.createPlayer(randomName()),
    )
  }, 7000)
}
