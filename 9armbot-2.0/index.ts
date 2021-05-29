import dotenvFlow from 'dotenv-flow'

dotenvFlow.config({
  default_node_env: 'development',
  purge_dotenv: true,
})

import { twitchService } from './services/twitch'
import { discordService } from './services/discord'
import setting from './services/setting'

async function main() {
  await twitchService()
  await discordService()
  await setting.init()
  setting.startAutoSync()

  console.log('9armbot 2.0 Running...')
}

main()
