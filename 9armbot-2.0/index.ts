import { twitchService } from './services/twitch'
import { discordService } from './services/discord'
import { dbService } from './services/db'

async function main() {
  dbService.load()
  dbService.save()

  await twitchService()
  await discordService()

  console.log('9armbot 2.0 Running...')

  setInterval(() => {
    console.log('db', 'save database', dbService.save())
  }, 15000)
}

main()
