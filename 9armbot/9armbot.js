require('dotenv').config({ path: './../.env'})
const tmi = require('tmi.js');
const fs = require('fs');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var oauth_token = fs.readFileSync('oauth_token', 'utf8');
const Utils = require('../core/utils')
const Player = require('./player')

var dodgeRate = 3;
var marketOpen = false;

var sentryMode = 1;

// var coins = {};
var sessionPayout = 0;
var sessionIncome = 0;

var botInfo = {
    critRate : 5,
    critMultiplier : 1.5,
    attackPower : 300,
    exp : 0,
    level : 1
};

let player = new Player()

function saveBotData () {
    data = JSON.stringify(botInfo);
    fs.writeFileSync('botstat.json', data, 'utf8');
}

function restoreBotData () {
    string = fs.readFileSync('botstat.json', 'utf8');
    botInfo = JSON.parse(string);
}

function giveCoinsToList(amount) {
   let players = player.getPlayers()
    for(let user of players){
        player.giveCoinsToPayer(user.username, amount)
        console.log(`${user.username} has ${user.coins} coins.`);
    }
    console.log(`Gave out ${amount} coins to ${players.length} users.`);
    return players.length;
}

function feedBot(channel, user, amount) {
    if (deductCoins(user.username, amount)) {
        botInfo.exp += amount;
        if (botInfo.exp >= 500) { // level up
            let levelup = parseInt(botInfo.exp/500);
            botInfo.level += levelup;
            botInfo.exp %= 500;
            botInfo.attackPower+=10*levelup;
            client.say(channel, `LEVEL UP!! ->${botInfo.level}`);
        }
    }
}

async function thanos (channel, byUser) {
    let thanosCost = 3000;
    let thanosTimeoutSeconds = 300;
    let casualties = 0;
    if (deductCoins(byUser.username, thanosCost) || byUser == 'armzi') {
        let players = player.getPlayers()
        for(let user of players){
            if (roll(50)){
                casualties++;
                console.log(`${user.username} got snapped.`);
                client.timeout(channel, user.username, thanosTimeoutSeconds, `โดนทานอสดีดนิ้ว`);
                await new Utils().sleep(2000)
            }
        }
        client.say(channel, `@${byUser.username} ใช้งาน Thanos Mode มี ${casualties} คนในแชทหายตัวไป....`);
    } else {
        timeoutUser(channel, byUser, botInfo.attackPower, `ค่าจ้างทานอส ${thanosCost} armcoin โว้ย..`);
    }
}

function gacha(channel, user, amount) {
    let gachaLegendaryRate = 2;
    let gachaMysticRate = 10;
    let Bonus = 1;
    if (amount == 0) return;

    let _player = player.getPlayerByUsername(user.username)
    // console.log(_player)
    if (_player && player.deductCoins(_player.username, amount)) {
        if (_player.coins == 0 && amount >= 10) {
            // user all-in.
            Bonus = 2;            
        }

        if (roll(gachaLegendaryRate)) {
            let multiplier = 5+Math.random()*5 + botInfo.level/100 * Bonus;
            let gain =  parseInt(amount*multiplier);
            player.giveCoinsToPayer(_player.username, gain)
            sessionPayout += gain - amount;
            if (Bonus!=1) {
                client.say(channel, `ALL-IN JACKPOT!! @${_player.username} ลงทุน ${amount} ->ได้รางวัล ${gain} armcoin. armKraab`);
            } else {
                client.say(channel, `JACKPOT!! @${_player.username} ลงทุน ${amount} ->ได้รางวัล ${gain} armcoin. armKraab`);
            }
        } else if (roll(gachaMysticRate)) {
            let multiplier = 2+Math.random()*3 + botInfo.level/100 * Bonus;
            let gain =  parseInt(amount*multiplier);
            player.giveCoinsToPayer(_player.username, gain)
            client.say(channel, `@${_player.username} ลงทุน ${amount} ->ได้รางวัล ${gain} armcoin.`);
            sessionPayout += gain - amount;
        } else {
            sessionIncome += amount;
            //client.say(channel, `🧂🧂🧂 @${_player.username} 🧂 LUL🧂🧂🧂🧂`);
        }
    } else {
        //timeoutUser(client.getChannel, user, botInfo.attackPower, `เล่นพนันไม่มีตังจ่าย ติดคุก`);
    }
}

function timeoutUser(channel, user, duration, reason) {

    // hard coded again. Need priviledge check.
    if (user.mod || user.username == 'armzi' ) {
        return;
    }

    let final_duration = duration;
    // roll perfect-dodge
    if (roll(dodgeRate)) {
        client.say(channel, `MISS!! ${user.username} หลบหลีกการโจมตี!`);
        return;
    }
    // roll crit
    if (roll(botInfo.critRate)) {
        final_duration *= botInfo.critMultiplier;
        client.say(channel, `@${user.username} ⚔️⚔️ CRITICAL!! รับโทษ x${botInfo.critMultiplier}`);
    }

    if (user.subscriber) {
        final_duration /= 2;
    }
    client.timeout(channel, user.username, final_duration, `${reason} (critRate = ${botInfo.critRate})`).catch((err) => {
        console.log(err);
    });
}

function roll (critRate) {
    dice = Math.random() * 100;
    if (dice < critRate)
        return true;
    return false;
}

const client = new tmi.Client({
    options: { debug: true},
    connection: { reconnect: true },
    identity: {
        username: process.env.tmi_username,
        password: oauth_token,
    },
    channels: [process.env.tmi_channel_name]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    if (self) return;

    /* mod can open/close the market. Allowing people to check/spend their coins. */
    if (tags.mod || tags.username == 'armzi') {
        let market_re = /!market\s*(open|close)/i;
        let market = message.match(market_re);

        if (market) {
            if (market[1] == 'open') {
                marketOpen = true;
                client.say(channel, 'market is now OPEN. (!coin,!gacha,!feed)');
            } else if (market[1] == 'close') {
                marketOpen = false;
                client.say(channel, 'market is now CLOSE.');
            }
            return;
        }
    }

    /* Give coins to a user. Testing command, only available to me. */
    let give_re = /^!give\s*([A-Za-z0-9_]*)\s*(\d*)/;
    group = message.match(give_re);
    if (group && tags.username == 'armzi') {
        if (group[1] && group[2]) {
            // giveCoinsToUser(channel, group[1], parseInt(group[2]));
            player.giveCoinsToPayer(group[1], parseInt(group[2]))
        }
    }


    if (message == '!whisper') {
        console.log('whisper..');
        client.whisper(tags.username, 'test');
    }
    if (message == '!github')
        client.say(channel, 'https://github.com/thananon/twitch_tools');


    /* MESSAGE FILTER:
       I added a low chance for timeout instead of kicking right away as chat will be full with
       kicking message and it is unpleasant. */

    if (sentryMode) {
        if (/[2๒]\s*[5๕]\s*([*xX]|คูณ|multiply)\s*[2๒]\s*[5๕]/i.test(message)) {
            client.say(channel, '225 ไง Land Protector อะ');
            if (roll (15))
                timeoutUser(channel, tags, botInfo.attackPower, 'เก่งคณิตศาสตร์');
            return;
        }

        let wanttofly = /อยากบิน.*/;
        if (wanttofly.test(message)) {
            if (roll(50))
                timeoutUser(channel, tags, botInfo.attackPower, 'อยากบิน');
            return;
        }
    }

    if (message == '!botstat') {
        client.say(channel, `<Level ${botInfo.level}> <EXP ${botInfo.exp}/500> <พลังโจมตี: ${botInfo.attackPower}> <%crit: ${botInfo.critRate}> <ตัวคูณ: ${botInfo.critMultiplier}>`);
        return;
    }

    /* reset bot stat */
    // Hard coded command for me. We will have to handle priviledge later.
    if (message == '!reset' && tags.username == 'armzi') {
        botInfo.critRate = 5;
        botInfo.critMultiplier = 1.5;
        botInfo.attackPower = 300;
        botInfo.exp = 0;
        botInfo.level = 1;
        return;
    }

    /* sentry mode is to toggle message filter on/off. */
    if (tags.username == "armzi" && message == '!sentry') {
        if (sentryMode == 1) sentryMode = 0;
        else sentryMode = 1;
        return
    }

    /* for testing purpose */
    if (message == '!give' && tags.username == "armzi") {
        client.say(channel, `gave ${giveCoinsToList(50)} users 50 coins.`); 
        return;
    }

    /* testing purpose, give myself bunch of coins */
    if (message == '!c') {
        player.giveCoinsToPayer('armzi', 999999)
        return;
    }

    if (marketOpen || tags.subscriber) {
        /* query amount of coin */
        if (message == '!coin') {
            let _player = player.getPlayerByUsername(tags.username)
            if (_player)
                client.say(channel, `@${_player.username} มี ${_player.coins} armcoin.`);
            else
                client.say(channel, `@${tags.username} มี 0 armcoin.`);
            return;
        }

        /* This should be fun, if its not broken. */
        /*if (message == '!thanos') {
            thanos(channel, tags);
            return;
        }*/

        /* usage: !gacha [amount] */
        /* We are trying to control the inflation. The return, on average should be a loss for users. */
        let gacha_re = /^!gacha\s*(\d*)/;
        let group = message.match(gacha_re);
        if (group) {
            if (!group[1])
                gacha(channel, tags, 1);
            else
                gacha(channel, tags, parseInt(group[1]));
            return;
        }

        if (message == '!allin'){
            let _player = player.getPlayerByUsername(tags.username)
            if (_player){
                gacha(channel, tags, _player.coins);
            }
        }
        /* This command let user feed the bot with armcoin. */
        /* usage: !feed [amount] */
        let feed_re = /^!feed\s*(\d*)/;
        group = message.match(feed_re);
        if (group) {
            if (!group[1])
                feedBot(channel, tags, 1);
            else
                feedBot(channel, tags, parseInt(group[1]));
        }
    }

    if (message == '!income' && tags.username == 'armzi'){
        client.say(channel, `Payout Total: ${sessionPayout} armcoin. Gacha Total = ${sessionIncome} Net: ${sessionIncome - sessionPayout}`);
    }

    if (message == '!save' && tags.username == 'armzi'){
        saveBotData();
    }

    if (message == '!load' && tags.username == 'armzi'){
        restoreBotData();
    }
});

client.on('subscription', (channel, username, method, message, userstate) => {
    botInfo.critRate+=2;
    client.say(channel, `>> botInfo.critRate+2% ด้วยพลังแห่งทุนนิยม (${botInfo.critRate}%) <<`);
    client.say(channel, `สมาชิก ${giveCoinsToList(1)} รายได้รับ 1 armcoin`);
    // giveCoinsToUser(channel, username, 10);
    player.giveCoinsToPayer(username,10)
});

client.on('resub', (channel, username, months, message, userstate, method) => {
    botInfo.critRate+=2;
    client.say(channel, `>> botInfo.critRate+2% ด้วยพลังแห่งทุนนิยม (${botInfo.critRate}%) <<`);
    client.say(channel, `สมาชิก ${giveCoinsToList(1)} รายได้รับ 1 armcoin`);
    // giveCoinsToUser(channel, username, 10);
    player.giveCoinsToPayer(username,10)
});

client.on('cheer', (channel, userstate, message) => {
    let amt =  userstate.bits/1000;
    client.say(channel, `>> ตัวคูณเพิ่มขึ้น ${amt} จากพลังของนายทุน <<`);
    botInfo.critMultiplier += amt;
});

client.on('connected', (address, port) => {
    restoreBotData();
    setInterval(saveBotData, 180000);
    console.log('Bot data restored...')
});
