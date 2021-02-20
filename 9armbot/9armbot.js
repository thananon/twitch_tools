require('dotenv').config({ path: './../.env' })
const tmi = require('tmi.js');
const fs = require('fs');
var oauth_token = fs.readFileSync('oauth_token', 'utf8');
const Utils = require('../core/utils')
const Player = require('./player')

var dodgeRate = 1;
var marketOpen = false;

var sentryMode = 1;

var sessionPayout = 0;
var sessionIncome = 0;

var botInfo = {
    critRate: 5,
    critMultiplier: 1.5,
    attackPower: 300,
    exp: 0,
    level: 1
};

let player = new Player()

function saveBotData() {
    data = JSON.stringify(botInfo);
    fs.writeFileSync('botstat.json', data, 'utf8');
}

function restoreBotData() {
    try {
        string = fs.readFileSync('botstat.json', 'utf8');
        botInfo = JSON.parse(string);
    } catch (err) {
        saveBotData()
    }
}

async function giveCoins_allonline(amount) {
    let players = await player.getOnlinePlayers();
    for (let username of players) {
        player.giveCoins(username, amount)
    }
    console.log(`Gave out ${amount} coins to ${players.length} users.`);
    return players.length;
}

function feedBot(channel, user, amount) {
    if (player.deductCoins(user.username, amount)) {
        botInfo.exp += amount;
        if (botInfo.exp >= 500) { // level up
            let levelup = parseInt(botInfo.exp / 500);
            botInfo.level += levelup;
            botInfo.exp %= 500;
            botInfo.attackPower += 10 * levelup;
            client.say(channel, `LEVEL UP!! -> ${botInfo.level}`);
        }
    }
}

async function thanos(channel, byUser) {
    let thanosCost = 3000;
    let thanosTimeoutSeconds = 180;
    let casualties = 0;
    console.log(`Thanos: I am inevitible..`)

    if (player.deductCoins(byUser.username, thanosCost) || checkBroadcaster(byUser)) {
        let players = await player.getOnlinePlayers()
        for (let user of players) {
            if (roll(50)) {
                casualties++;
                console.log(`${user.username} got snapped.`);
                client.timeout(channel, user.username, thanosTimeoutSeconds, `โดนทานอสดีดนิ้ว`);
                await new Utils().sleep(700)
            }
        }
        client.say(channel, `@${byUser.username} ใช้งาน Thanos Mode มี ${casualties} คนในแชทหายตัวไป....`);
    } else {
        //timeoutUser(channel, byUser, botInfo.attackPower, `ค่าจ้างทานอส ${thanosCost} armcoin โว้ย..`);
    }
}

function gacha(channel, user, amount) {
    let gachaLegendaryRate = 2;
    let gachaMysticRate = 10;
    let Bonus = 1;
    if (amount == 0) return;

    let _player = player.getPlayerByUsername(user.username)
    if (_player && player.deductCoins(_player.username, amount)) {
        if (_player.coins == 0 && amount >= 10) {
            Bonus = 2;
        }

        if (roll(gachaLegendaryRate)) {
            let multiplier = 5 + Math.random() * 5 + botInfo.level / 100 * Bonus;
            let gain = parseInt(amount * multiplier);
            _player.coins += gain
            sessionPayout += gain - amount;
            if (Bonus != 1) {
                client.say(channel, `ALL-IN JACKPOT!! @${_player.username} ลงทุน ${amount} -> ได้รางวัล ${gain} armcoin. armKraab`);
            } else {
                client.say(channel, `JACKPOT!! @${_player.username} ลงทุน ${amount} -> ได้รางวัล ${gain} armcoin. armKraab`);
            }
        } else if (roll(gachaMysticRate)) {
            let multiplier = 2 + Math.random() * 3 + botInfo.level / 100;
            let gain = parseInt(amount * multiplier);
            _player.coins += gain
            client.say(channel, `@${_player.username} ลงทุน ${amount} -> ได้รางวัล ${gain} armcoin.`);
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
    if (user.mod || player.isAdmin(user)) {
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

    client.timeout(channel, user.username, final_duration, `${reason} (critRate = ${botInfo.critRate})`).catch((err) => {
        console.error(err);
    });
}

function roll(critRate) {
    dice = Math.random() * 100;
    return dice < critRate;
}

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

client.on("message", onMessageHandle);

const command = {
    "!market": setMarket,
    "!kick": kickUser
}

function onMessageHandle(channel, userstate, message, self) {
    if (self) return;

    const messageCommand = message.spit(" ")[0]

    if (messageCommand in command) {
        tempParameter = {
            channel: channel,
            userstate: userstate,
            message: message,
            self: self
        };
        command[messageCommand](tempParameter);
    }

    /* Give coins to a user. Testing command, only available to me. */
    let give_re = /^!give\s*([A-Za-z0-9_]*)\s*(\d*)/;
    group = message.match(give_re);
    if (group && checkBroadcaster(userstate)) {
        if (group[1] && group[2]) {
            player.giveCoins(group[1], parseInt(group[2]))
        }
    }
    /*
        if (message == '!whisper') {
            console.log('whisper..');
            client.whisper(tags.username, 'test');
        }
    */
    if (message == '!github')
        client.say(channel, 'https://github.com/thananon/twitch_tools');


    /* MESSAGE FILTER:
       I added a low chance for timeout instead of kicking right away as chat will be full with
       kicking message and it is unpleasant. */

    if (sentryMode) {
        if (/[2๒]\s*[5๕]\s*([*xX]|คูณ|multiply)\s*[2๒]\s*[5๕]/i.test(message)) {
            client.say(channel, '225 ไง Land Protector อะ');
            if (roll(15))
                timeoutUser(channel, userstate, botInfo.attackPower, 'เก่งคณิตศาสตร์');
            return;
        }

        let wanttofly = /อยากบิน.*/;
        if (wanttofly.test(message)) {
            if (roll(50))
                timeoutUser(channel, userstate, botInfo.attackPower, 'อยากบิน');
            return;
        }
    }

    if (message == '!botstat') {
        client.say(channel, `<Level ${botInfo.level}> <EXP ${botInfo.exp}/500> <พลังโจมตี: ${botInfo.attackPower}> <%crit: ${botInfo.critRate}> <ตัวคูณ: ${botInfo.critMultiplier}> <Gacha Bonus +${botInfo.level}%>`);
        return;
    }

    /* reset bot stat */
    // Hard coded command for me. We will have to handle priviledge later.
    if (message == '!reset' && checkBroadcaster(userstate)) {
        botInfo.critRate = 5;
        botInfo.critMultiplier = 1.5;
        botInfo.attackPower = 300;
        botInfo.exp = 0;
        botInfo.level = 1;
        return;
    }

    /* sentry mode is to toggle message filter on/off. */
    if (checkBroadcaster(userstate) && message == '!sentry') {
        sentryMode = !sentryMode;
        return
    }

    /* for testing purpose */
    if (message == '!give' && checkBroadcaster(userstate)) {
        giveCoins_allonline(50).then(function (total) {
            client.say(channel, `gave ${total} users 50 coins.`);
        });
        return;
    }

    /* testing purpose, give myself bunch of coins */
    /*if (message == '!c') {
        player.giveCoins('armzi', 999999)
        return;
    }*/

    /* This should be fun, if its not broken. */
    if (message == '!thanos' && checkBroadcaster(userstate)) {
        thanos(channel, userstate);
        return;
    }

    if (marketOpen || checkSubscriber(userstate)) {
        /* query amount of coin */
        if (message == '!coin') {
            let _player = player.getPlayerByUsername(userstate.username)
            if (_player)
                client.say(channel, `@${_player.username} มี ${_player.coins} armcoin.`);
            else
                client.say(channel, `@${userstate.username} มี 0 armcoin.`);
            return;
        }


        /* usage: !gacha [amount] */
        /* We are trying to control the inflation. The return, on average should be a loss for users. */
        let gacha_re = /^!gacha\s*(\d*)/;
        let group = message.match(gacha_re);
        if (group) {
            if (!group[1])
                gacha(channel, userstate, 1);
            else
                gacha(channel, userstate, parseInt(group[1]));
            return;
        }

        if (message == '!allin') {
            let _player = player.getPlayerByUsername(userstate.username)
            if (_player) {
                gacha(channel, userstate, _player.coins);
            }
        }
        /* This command let user feed the bot with armcoin. */
        /* usage: !feed [amount] */
        let feed_re = /^!feed\s*(\d*)/;
        group = message.match(feed_re);
        if (group) {
            if (!group[1])
                feedBot(channel, userstate, 1);
            else
                feedBot(channel, userstate, parseInt(group[1]));
        }
    }

    if (message == '!income' && checkBroadcaster(userstate)) {
        client.say(channel, `Payout Total: ${sessionPayout} armcoin. Gacha Total = ${sessionIncome} Net: ${sessionIncome - sessionPayout}`);
    }

    if (message == '!save' && checkBroadcaster(userstate)) {
        saveBotData();
        player.saveData();
    }

    if (message == '!load' && checkBroadcaster(userstate)) {
        restoreBotData();
    }
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
                else{
                    client.say(channel, 'market is already CLOSE.');
                }
            }
            return;
        }
    }
}

function checkMod(userstate) {
    return userstate.mod || "broadcaster" in userstate.badges
}


function checkBroadcaster(userstate) {
    return "broadcaster" in userstate.badges
}

function checkSubscriber(userstate) {
    return "founder" in userstate.badges || userstate.subscriber
}

function subscriptionPayout(channel, username) {
    botInfo.critRate += 2;
    client.say(channel, `>> botInfo.critRate+2% ด้วยพลังแห่งทุนนิยม (${botInfo.critRate}%) <<`);
    giveCoins_allonline(1).then(function (total) {
        client.say(channel, `${username} ได้รับ 10 armcoin จากการ subscribe และสมาชิก ${total} รายได้รับ 1 armcoin.`);
    });
    player.giveCoins(username, 10)
}

client.on('subscription', (channel, username, method, message, userstate) => {
    subscriptionPayout(channel, username);
});

client.on('resub', (channel, username, months, message, userstate, method) => {
    subscriptionPayout(channel, username);
});

client.on('subgift', (channel, username, streakmonth, recipient, methods, userstate) => {
    player.giveCoins(username, 10);
    client.say(channel, `${username} ได้รับ 10 armcoin จากการ Gift ให้ ${recipient} armKraab `);
});

client.on('submysterygift', (channel, username, streakmonth, num, method, userstate) => {
    if (!num) num = 1;
    player.giveCoins(username, 10 * num);
    client.say(channel, `${username} ได้รับ ${10 * num} armcoin จากการ Gift ให้สมาชิก ${num} คน armKraab `);
});

client.on('cheer', (channel, userstate, message) => {
    let amt = userstate.bits / 1000;
    client.say(channel, `>> ตัวคูณเพิ่มขึ้น ${amt} จากพลังของนายทุน <<`);
    botInfo.critMultiplier += amt;
});

client.on('connected', (address, port) => {
    restoreBotData();
    setInterval(saveBotData, 60000);
    sentryMode = 0;
    console.log('Bot data restored...');
});
