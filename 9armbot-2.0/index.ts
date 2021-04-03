import { twitchService } from './services/twitch'
import { discordService } from './services/discord'

async function main() {
  await twitchService()
  await discordService()

  console.log('9armbot 2.0 Running...')
}

main()
