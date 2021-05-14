import dotenvFlow from 'dotenv-flow'

import { twitchService } from './services/twitch'
import { discordService } from './services/discord'
import setting from './services/setting'

dotenvFlow.config({
  default_node_env: 'development',
  purge_dotenv: true,
})

async function main() {
  await twitchService()
  await discordService()
  setting.startAutoSync()
  setting.onReady(() => console.log('Setting Ready'))

  console.log('9armbot 2.0 Running...')
}

main()
