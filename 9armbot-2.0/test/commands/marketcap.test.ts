import commands from '../../services/bot'
import prisma from '../../../prisma/client'

beforeEach(async () => {
  await prisma.player.deleteMany()

  await prisma.player.create({
    data: {
      username: 'foo',
      coins: 10,
    },
  })

  await prisma.player.create({
    data: {
      username: 'bar',
      coins: 15,
    },
  })
})

describe('marketcap', () => {
  it('exists', () => {
    expect(commands.marketcap).toBeDefined()
  })

  it('returns sum of all player coins, times with 3000', async () => {
    const result = await commands.marketcap()

    expect(result).toEqual(
      expect.objectContaining({
        data: {
          coins: 25,
          baht: 25 * 3000,
        },
      }),
    )
  })

  it('is cached for 60 seconds to prevent multiple requests', async () => {
    const result1 = await commands.marketcap()

    expect(result1).toEqual(
      expect.objectContaining({
        data: {
          coins: 25,
          baht: 25 * 3000,
        },
      }),
    )

    await prisma.player.create({
      data: {
        username: 'baz',
        coins: 15000,
      },
    })

    const result2 = await commands.marketcap()

    expect(result2).toEqual(
      expect.objectContaining({
        data: {
          coins: 25,
          baht: 25 * 3000,
        },
      }),
    )
  })
})
