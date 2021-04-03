import tmi from 'tmi.js'
import fs from 'fs'
import path from 'path'
import { Db } from './db'

let oauth_token = fs.readFileSync(
  path.resolve(__dirname, '../../9armbot/oauth_token'),
  'utf8',
)

export async function twitchService() {
  const dbService = new Db()

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
  setInterval(async () => {
    const data = await dbService.read()
    console.log('twitch read db from dbservice', data)
  }, 2000)
}
