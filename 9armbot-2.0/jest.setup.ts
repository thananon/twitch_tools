import dotenvFlow from 'dotenv-flow'
import prisma from '../prisma/client'

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
})
