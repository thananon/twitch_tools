import dotenvFlow from 'dotenv-flow'
import prisma from '../prisma/client'

dotenvFlow.config({
  default_node_env: 'test',
  purge_dotenv: true,
})

beforeAll(async () => {
  await prisma.player.deleteMany()
})
