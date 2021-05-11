import dotenvFlow from 'dotenv-flow'

import { twitchService } from './services/twitch'
import { discordService } from './services/discord'
import Setting from './services/setting'

dotenvFlow.config({
  default_node_env: 'development',
  purge_dotenv: true,
})

async function main() {
  await twitchService()
  await discordService()
  await Setting.init()

  console.log('9armbot 2.0 Running...')
}

main()
