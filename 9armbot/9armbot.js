// require('dotenv').config({ path: '.env' })
const tmi = require('tmi.js');
// const fs = require('fs');
// var oauth_token = fs.readFileSync('oauth_token', 'utf8');
// const Utils = require('../core/utils')
// const Player = require('./player')

// .toLocaleString()

const { pathDB, permission, status, gachaRate } = require("./Variable.js");
var { session, mode, botInfo, botDialogue, user, userID } = require("./Variable.js");

const client = new tmi.Client({
    options: { debug: false },
    connection: { reconnect: true },
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_BOT_OAUTH_TOKEN,
    },
    channels: [process.env.TWITCH_BOT_CHANNEL]
});


client.on('message', onMessageHandler);
client.on('cheer', onCheerHandler);
client.on('subscription', onSubHandler);
client.on('resub', onReSubHandler);
client.on('subgift', onSubGiftHandler);
client.on('submysterygift', onSubGiftMysteryHandler);
client.on('connected', onConnectedHandler);

client.connect();

const command = {
    "!c": checkCoin,
    "!g": gacha,
    "!git": githubLink,

    "!allin": gacha,
    "!coin": checkCoin,
    "!gacha": gacha,
    "!github" : githubLink
}

// client event 
function onMessageHandler(channel, userstate, message, self) {
    const state = {
        channel: channel,
        userstate: userstate,
        message: message,
        self: self
    };
    let userCommand = message.split(" ")[0].toLowerCase();

    checkNewUser(userstate);

    if (userCommand in command)
        command[userCommand](state);
}

function onCheerHandler(channel, userstate, message) {
    let amount = userstate.bits / 1000;
    client.say(channel, botDialogue["cheer"](amount));
    botInfo.crit.multiplier += amount;
}

function onSubHandler(channel, username, method, message, userstate) {
}

function onReSubHandler(channel, username, months, message, userstate, method) {
}

function onSubGiftHandler(channel, username, streakMonths, recipient, methods, userstate) {
}

function onSubGiftMysteryHandler(channel, username, numbOfSubs, methods, userstate) {
}

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}


function getPermissionOf(userstate) {
    /**
     ***************************
     * role        *    return *
     ***************************
     * owner       *         0 *
     * mod         *         1 *
     * subscriber  *         2 *
     * viewer      *         3 *
     ***************************
     */

    if ("broadcaster" in userstate.badges)
        return permission.ONWER;
    if (userstate.mod)
        return permission.MOD;
    if ("founder" in userstate.badges || userstate.subscriber)
        return permission.SUBSCRIBER;
    return permission.VIEWER;
}

function checkNewUser(userstate, amount = 0) {
    let id = parseInt(userstate["user-id"]);
    let username = userstate["display-name"];

    if (!(id in userID)) {
        // new user
        userID[id] = username;

        user[username] = {
            "amount": amount,
            "user-id": id
        };
    } else if (!(username in user)) {
        // user changes their name swap to new username.
        let oldUserName = userID[id];
        userID[id] = username;
        user[username] = user[oldUserName];

        delete user[oldUserName];
        console.log(`rename ${oldUserName} to ${username}`);
    }
}

function checkCoin(state) {
    // allow owner mod sub or market is open
    if (!(getPermissionOf(state.userstate) < 3 || mode.market == status.OPEN)) return;
    let username = state.userstate["display-name"];

    checkNewUser(state.userstate);

    const amount = user[username]["amount"];
    let tempParameter = {
        username: username,
        amount: amount
    };

    client.say(state.channel, botDialogue["checkCoin"](tempParameter));
}

function gacha(state) {
    // allow owner mod sub or market is open
    if (!(getPermissionOf(state.userstate) < 3 || mode.market == status.OPEN)) return;
    let userId = state.userstate["user-id"];
    let username = state.userstate["display-name"];

    const message = state.message.toLowerCase();
    let allIn = false;

    // do nothing when bad command 
    const regex = /^!(g|gacha) (\d+)$/i;
    if (message == "!allin") {
        allIn = true;
    } else if (!regex.test(state.message)) return;

    const messageSplit = state.message.split(" ");
    // all in betAmount = user coin
    const betAmount = allIn ? user[username].amount : parseInt(messageSplit[1]);

    // do nothing when betting < 1 or coins are insufficient.
    if (betAmount < 1 || user[username].amount < betAmount) return;

    // !gacha all-in
    if (user[username].amount == betAmount) allIn = true;

    user[username].amount -= betAmount;
    session.Income += betAmount;

    let multiplier = 0;
    let chance = Math.random() * 100;

    // calculate multiplier
    // legendary
    if (chance < gachaRate.legendary.rate) {
        multiplier = gachaRate.legendary.initMultiplier;
        multiplier += Math.random() * gachaRate.legendary.multiplier;
    }// mystic
    else if (chance < gachaRate.mystic.rate) {
        multiplier = gachaRate.mystic.initMultiplier;
        multiplier += Math.random() * gachaRate.mystic.multiplier;
    }

    // store value and display result
    // get jeckpot
    if (multiplier != 0) {
        // all in multiplier
        if (allIn) multiplier *= gachaRate.allin.multiplier;
        let gain = parseInt(betAmount * multiplier + (botInfo.level / 100));

        // store value
        user[username].amount += gain;
        session.Payout += gain;

        let tempParameter = {
            username: username,
            amount: betAmount,
            gain: gain
        };

        // display result
        if (chance < gachaRate.legendary.rate) {
            if (allIn)
                client.say(state.channel, botDialogue["gacha_all-in"](tempParameter));
            else
                client.say(state.channel, botDialogue["gacha_legendary"](tempParameter));
        }
        else if (chance < gachaRate.mystic.rate) {
            client.say(state.channel, botDialogue["gacha_mystic"](tempParameter));
        }
    }
}

function githubLink(state){
    client.say(state.channel, botDialogue["github"]);
}



















function kickUser(state) {
    const message = state.message;
    const userId = state.userstate["display-name"];

    let kick_re = /!kick\s*([A-Za-z0-9_]*)/;
    let kick = message.match(kick_re);

    if (checkMod(state.userstate)) {
        if (kick && kick[1]) {
            let user = {
                username: kick[1],
                isMod: false
            };
            timeoutUser(channel, user, botInfo.attackPower, `${userId} สั่งมา`);
        }
    }
}

function setMarket(state) {
    /* mod can open/close the market. Allowing people to check/spend their coins. */
    const message = state.message;

    const market_re = /!market\s*(open|close)/i;

    if (checkMod(state.userstate)) {
        const market = message.test(market_re)
        if (market) {
            if (market[1] == 'open') {
                if (!marketOpen) {
                    marketOpen = true;
                    client.say(channel, 'market is now OPEN. (!coin,!gacha,!feed)');
                }
                else {
                    client.say(channel, 'market is already OPEN.');
                }
            } else if (market[1] == 'close') {
                if (marketOpen) {
                    marketOpen = false;
                    client.say(channel, 'market is now CLOSE.');
                }
                else {
                    client.say(channel, 'market is already CLOSE.');
                }
            }
            return;
        }
    }
}



