import commands from '../../services/bot'
import prisma from '../../../prisma/client'
import setting from '../../services/setting'

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
})
