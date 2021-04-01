import tmi from 'tmi.js'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'
import { dbService } from './db'

dotenv.config()

let oauth_token = fs.readFileSync(
  path.resolve(__dirname, '../../9armbot/oauth_token'),
  'utf8',
)

export async function twitchService() {
  const client = new tmi.Client({
    options: { debug: true },
    connection: { reconnect: true },
    identity: {
      username: process.env.tmi_username,
      password: oauth_token,
    },
    channels: [process.env.tmi_channel_name as string],
  })

  await client.connect()

  // Test db reading
  setInterval(() => {
    console.log('twitch read db from dbservice', dbService.read())
  }, 2000)

  setInterval(() => {
    console.log(
      'twitch',
      'test adding random players',
      dbService.createPlayer(Math.random().toString()),
    )
  }, 6000)
}
