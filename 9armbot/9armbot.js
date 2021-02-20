require('dotenv').config({ path: '.env' })
const tmi = require('tmi.js');
// const fs = require('fs');
// var oauth_token = fs.readFileSync('oauth_token', 'utf8');
// const Utils = require('../core/utils')
// const Player = require('./player')

import { path, permission, status, session, mode, botInfo, botDialogue, client} from '9armbot/Variable.js'

client.on('message', onMessageHandler);
client.on('cheer', onCheerHandler);
client.on('subscription', onSubHandler);
client.on('resub', onReSubHandler);
client.on('subgift', onSubGiftHandler);
client.on('submysterygift', onSubGiftMysteryHandler);
client.on('connected', onConnectedHandler);

const command = {
    "!market": setMarket,
    "!kick": kickUser
}

// client event 
function onMessageHandler(channel, userstate, message, self) {
}

function onCheerHandler(channel, userstate, message) {
}

function onSubHandler(channel, username, method, message, userstate) {
}

function onReSubHandler(channel, username, months, message, userstate, method) {
}

function onSubGiftHandler(channel, username, streakMonths, recipient, methods, userstate){
}

function onSubGiftMysteryHandler(channel, username, numbOfSubs, methods, userstate){
}

function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}


function roll(change) {
    const dice = Math.random() * 100;
    return dice < change;
}

function getPermissionOf(userstate) {
    if ("broadcaster" in userstate.badges)
        return permission.ONWER;
    if (userstate.mod)
        return permission.MOD;
    if ("founder" in userstate.badges || userstate.subscriber)
        return permission.SUBSCRIBER;
    return permission.VIEWER;
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



