import commands from '../../services/bot'
import prisma from '../../../prisma/client'
import Player from '../../services/models/player'

beforeEach(async () => {
  jest.spyOn(global.Math, 'random').mockReturnValue(0.5)

  await prisma.player.deleteMany()
})

afterEach(() => {
  jest.spyOn(global.Math, 'random').mockRestore()
})

describe('giveCoin', () => {
  it('gives 10 coins to player by default', async () => {
    const result = await commands.giveCoin('foo')
    let player = await Player.withUsername('foo')

    expect(result).toEqual({ data: 10 })
    expect(await player.coins()).toEqual(10)
  })

  it('gives amount of coins to existing player', async () => {
    await prisma.player.create({
      data: {
        username: 'foo',
        coins: 2,
      },
    })

    const result = await commands.giveCoin('foo', 13)
    let player = await Player.withUsername('foo')

    expect(result).toEqual({ data: 2 + 13 })
    expect(await player.coins()).toEqual(15)
  })
})

describe('giveCoinToList', () => {
  it('gives coins to each player in list, then return amount of players updated', async () => {
    await prisma.player.create({
      data: {
        username: 'foo',
        coins: 10,
      },
    })

    await prisma.player.create({
      data: {
        username: 'bar',
        coins: 5,
      },
    })

    const result = await commands.giveCoinToList(['foo', 'BAR', 'baz'], 10)

    expect(result).toEqual({ data: 2 })

    let playerFoo = await Player.withUsername('foo')
    let playerBar = await Player.withUsername('bar')

    expect(await playerFoo.coins()).toEqual(10 + 10)
    expect(await playerBar.coins()).toEqual(5 + 10)
  })
})
