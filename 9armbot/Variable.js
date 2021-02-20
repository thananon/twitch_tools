require('dotenv').config({ path: '.env' })
const tmi = require('tmi.js');

const path = {
    bot = "9armbot/db/botstat.json",
    user = "9armbot/db/players.json"
}

const permission = {
    ONWER: 0,
    MOD: 1,
    SUBSCRIBER: 2,
    VIEWER: 3
}

const status = {
    OPEN = true,
    CLOSE = false
};

var session = {
    Payout: 0,
    Income: 0
};

var mode = {
    market: status.CLOSE,
    sentry: {
        mode: status.CLOSE,
        dodgeRate: 1
    }
};

var botInfo = {
    level: 1,
    attackPower: 300,
    crit: {
        rate: 5,
        multiplier: 1.5
    },
    exp: {
        current: 0,
        max = 500
    }
};

var botDialogue = {
    "temp" : "temp"
};

const client = new tmi.Client({
    options: { debug: true },
    connection: { reconnect: true },
    identity: {
        username: process.env.tmi_username,
        password: oauth_token,
    },
    channels: [process.env.tmi_channel_name]
});