import dotenvFlow from 'dotenv-flow'
import { twitchService } from './services/twitch'
import { discordService } from './services/discord'

dotenvFlow.config({
  default_node_env: 'development',
})

async function main() {
  await twitchService()
  await discordService()

  console.log('9armbot 2.0 Running...')
}

main()
