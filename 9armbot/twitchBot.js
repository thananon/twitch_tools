require('dotenv').config({ path: '../.env' });
const io = require("socket.io-client");
const socket = io("ws://localhost:3000");
const tmi = require('tmi.js');
const fs = require('fs');

const oauth_token = fs.readFileSync('oauth_token', 'utf8');

const prefix = "!";
var isMarketOpen = false;
var isSentryMode = false;

const client = new tmi.Client({
    options: { debug: true },
    connection: { reconnect: true },
    identity: {
        username: process.env.tmi_username,
        password: oauth_token,
    },
    channels: [process.env.tmi_channel_name]
});

client.connect();

client.on('message', (channel, userstate, message, self) => {
    if (self) return;
    if (message.indexOf(prefix) !== 0) return;
    const args = message.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command == 'time') {
        let time = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
        client.say(channel, `เวลานายอาร์มตอนนี้คือ ${time}`);
        return;
    }

    if (command == 'github') {
        client.say(channel, 'https://github.com/thananon/twitch_tools');
        return;
    }

    // Market commands
    if (isMarketOpen || isSubscriberByUserstate(userstate)) {
        if (command == 'coin') {
            socket.emit("getTwitchCoinsByUsername", {
                twitchUsername: userstate.username,
                channelID: channel
            });
            return;
        }
    }

    var isMod = userstate.mod;
    var isAdmin = isAdminByUsername(userstate.username);

    // Mod & Admin commands
    if (isAdmin || isMod) {
        if (command == 'market') {
            if (args[0] == undefined) return;

            if (args[0] == 'close') {
                isMarketOpen = false;
                client.say(channel, 'market is now CLOSE.');
            } else if (args[0] == 'open') {
                isMarketOpen = true;
                client.say(channel, 'market is now OPEN. (!coin,!gacha,!feed)');
            }
            return;
        }

        if (command == 'sentry') {
            isSentryMode = !isSentryMode;
            return;
        }
    }
});

socket.on("getTwitchCoinsByUsername", (data) => {
    var channel = data.data.channelID;
    var twitchUsername = data.data.twitchUsername;

    if (data.success == true) {
        var amount = data.data.coins;
        client.say(channel, `@${twitchUsername} มี ${amount} armcoin.`);
    } else {
        client.say(channel, `@${twitchUsername} มี 0 armcoin.`);
    }
});

function isAdminByUsername(username) {
    return username == process.env.admin_username ? true : false;
}

function isSubscriberByUserstate(userstate) {
    if (userstate.badges && "founder" in userstate.badges)
        return true;
    return userstate.subscriber
}