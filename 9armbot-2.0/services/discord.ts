import dotenv from 'dotenv'
import { customAlphabet } from 'nanoid'
import { Db } from './db'

dotenv.config()

export async function discordService() {
  const dbService = new Db()

  // Test db reading
  setInterval(async () => {
    const data = await dbService.read()
    console.log('discord read db from dbservice', data)
  }, 2500)

  // Test db writing
  const randomName = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8)

  setInterval(async () => {
    console.log(
      'discord',
      'test adding random players',
      await dbService.createPlayer(randomName()),
    )
  }, 7000)
}
