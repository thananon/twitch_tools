// FIXME : Refactor & Fix typing

import Discord, { BaseClient } from "discord.js";

const UnmockedDiscord = jest.requireActual("discord.js") as typeof Discord;
const unmockedClient = new Discord.Client();
const mockedDiscord = jest.createMockFromModule("discord.js") as typeof Discord;

const listeners: { [key: string]: Function } = {};

export const client = {
  ...unmockedClient,
  login: jest.fn().mockResolvedValue(() => {
    console.log("login called");
  }),
  on: jest.fn().mockImplementation((event, listener) => {
    listeners[event] = listener;
  }) as BaseClient["on"],
  channels: {
    cache: {
      get: jest.fn().mockImplementation((_channelId) => {
        return channel;
      }),
    },
  },
};

export const channel = {
  send: jest.fn(),
};

jest.spyOn(Discord, "Client").mockImplementation(() => {
  return (client as unknown) as Discord.Client;
});
jest.spyOn(Discord, "MessageEmbed").mockImplementation(() => {
  return new UnmockedDiscord.MessageEmbed();
});

export const mockMessage = async function (payload: {
  channel: any;
  author: any;
  content: string;
}) {
  const callback = listeners["message"];
  payload.channel.send = channel.send;
  await callback(payload);

  return unmockedClient;
};

export default mockedDiscord;
