import dotenvFlow from 'dotenv-flow'
import prisma from '../prisma/client'
import setting from './services/setting'

dotenvFlow.config({
  default_node_env: 'test',
  purge_dotenv: true,
})

// Mock entire webapp
jest.mock('../webapp', () => ({
  express: jest.fn(),
  socket: {
    io: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
    })),
  },
  port: null,
  host: null,
  url: null,
}))

beforeAll(async () => {
  await prisma.player.deleteMany()
  await prisma.setting.deleteMany()

  await setting.init()
})

afterAll(async () => {
  await prisma.$disconnect()
})
