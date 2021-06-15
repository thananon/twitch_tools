// FIXME : Refactor & Fix typing

import tmi, { ClientBase } from "tmi.js"

const unmockedClient = new tmi.Client({})
const mockedTmi = jest.createMockFromModule("tmi.js") as typeof tmi

const listeners: { [key: string]: Function } = {}

export const client = {
  ...unmockedClient,
  connect: jest.fn().mockResolvedValue(() => {
    console.log("connect called")
  }),
  on: jest.fn().mockImplementation((event, listener) => {
    listeners[event] = listener
  }) as ClientBase["on"],
  timeout: jest.fn(),
}

jest.spyOn(tmi, "Client").mockImplementation(() => {
  return client as unknown as tmi.Client
})

export const mockMessage = async function (payload: {
  channel?: string
  tags?: {
    // Allow 2-level hash
    [x: string]:
      | string
      | null
      | boolean
      | {
          [x: string]: string
        }
  }
  message: string
  self?: boolean
}) {
  payload.tags = payload.tags || {}
  payload.self = !!payload.self

  const callback = listeners["message"]
  await callback(payload.channel, payload.tags, payload.message, payload.self)
  return unmockedClient
}

export const mockSubscription = async function (payload: { username: string }) {
  const callback = listeners["subscription"]
  await callback(
    "_channel",
    payload.username,
    "_methods",
    "_message",
    "_userstate"
  )
  return unmockedClient
}

export const mockResub = async function (payload: { username: string }) {
  const callback = listeners["resub"]
  await callback(
    "_channel",
    payload.username,
    2, // Months resubbed
    "_methods",
    "_message",
    "_userstate"
  )
  return unmockedClient
}

export const mockSubgift = async function (payload: {
  username: string
  recipient: string
}) {
  const callback = listeners["subgift"]
  await callback(
    "_channel",
    payload.username,
    2, // Months streak
    payload.recipient,
    "_methods",
    "_userstate"
  )
  return unmockedClient
}

export default mockedTmi
