// FIXME : Refactor & Fix typing

import tmi, { ClientBase } from "tmi.js";

const unmockedClient = new tmi.Client({});
const mockedTmi = jest.createMockFromModule("tmi.js") as typeof tmi;

const listeners: { [key: string]: Function } = {};

export const client = {
  ...unmockedClient,
  connect: jest.fn().mockResolvedValue(() => {
    console.log("connect called");
  }),
  on: jest.fn().mockImplementation((event, listener) => {
    listeners[event] = listener;
  }) as ClientBase["on"],
};

jest.spyOn(tmi, "Client").mockImplementation(() => {
  return client;
});

export const mockMessage = function (payload: {
  channel: string;
  tags?: {
    // Allow 2-level hash
    [x: string]:
      | string
      | null
      | boolean
      | {
          [x: string]: string;
        };
  };
  message: string;
  self?: boolean;
}) {
  payload.tags = payload.tags || {};
  payload.self = !!payload.self;

  const callback = listeners["message"];
  callback(payload.channel, payload.tags, payload.message, payload.self);
  return unmockedClient;
};

export default mockedTmi;
