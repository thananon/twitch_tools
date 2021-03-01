require('dotenv').config({ path: '../.env' });
const webapp = require("../webapp");
const tmi = require('tmi.js');
const fs = require('fs');
var oauth_token = fs.readFileSync('oauth_token', 'utf8');
var discord_token = fs.readFileSync('discord_token', 'utf8');
const { sleep, roll } = require('../core/utils');
const Player = require('./player');
const DiscordBot = require('./discord_bot')
const { MARKET_KEY } = require('../core/market_dashboard')

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
let discordBot = new DiscordBot(player=player)
discordBot.login(discord_token)

// Graceful Shutdown
function gracefulShutdown() {
    console.log('\nPre-Close')
    saveBotData()
    player.saveData()
    setTimeout(() => {
        console.log('Closed')
        process.exit(0)
    }, 1000)
}
process.on("SIGINT", () => gracefulShutdown())
process.on("SIGTERM", () => gracefulShutdown())
process.on('uncaughtException', (err) => {
    console.error(err)
    gracefulShutdown()
})

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

function baseExp() {
    return 500 + (botInfo.level * 50) - 50;
}

function feedBot(channel, user, amount) {
    if (player.deductCoins(user.username, amount)) {
        botInfo.exp += amount;
        const oldLevel = botInfo.level;

        webapp.socket.io().emit("widget::killfeed", {
            message: `<b class="badge bg-primary">${user.username}</b> <i class="fas fa-pizza-slice"></i> <i class="fas fa-robot"></i> <b class="badge bg-info">${process.env.tmi_username}</b> x${amount}`,
        });
        while (true) {
            const bexp = baseExp();
            if (botInfo.exp >= bexp) {
                botInfo.exp -= bexp;
                botInfo.level++;

                webapp.socket.io().emit("widget::killfeed", {
                    message: `<i class="fas fa-robot"></i> <b class="badge bg-info">${process.env.tmi_username}</b> <b>LEVEL UP!</b> <i class="fas fa-level-up-alt"></i> <b class="badge bg-primary">${botInfo.level}</b>`,
                });

            } else {
                break;
            }
        }
        const levelUp = botInfo.level - oldLevel;
        if (levelUp > 0) {
            botInfo.attackPower += 10 * levelUp;
            client.say(channel, `LEVEL UP!! ${oldLevel} -> ${botInfo.level}, NextLevel: ${botInfo.exp}/${baseExp()}`);
        }
    }
}

async function thanos(channel, byUser) {
    let thanosCost = 3000;
    let thanosTimeoutSeconds = 180;
    let casualties = 0;
    console.log(`Thanos: I am inevitible..`)

    if (player.deductCoins(byUser.username, thanosCost) || player.isAdmin(byUser.username)) {
        let players = await player.getOnlinePlayers()
        webapp.socket.io().emit("widget::alerts", {
            itemKey: 1
        });
        for (let username of players) {
            if (roll(50)) {
                casualties++;
                console.log(`${username} got snapped.`);
                client.timeout(channel, username, thanosTimeoutSeconds, `โดนทานอสดีดนิ้ว`);

                webapp.socket.io().emit("widget::killfeed", {
                    message: `<b class="badge bg-primary">THANOS</b> <i class="fas fa-hand-point-up"></i> <b class="badge bg-danger">${username}</b> (<i class="fas fa-user-alt-slash"></i>${casualties})`,
                });
                await sleep(620);
            }
        }
        client.say(channel, `@${byUser.username} ใช้งาน Thanos Mode มี ${casualties} คนในแชทหายตัวไป....`);
    } else {
        //timeoutUser(channel, byUser, botInfo.attackPower, `ค่าจ้างทานอส ${thanosCost} armcoin โว้ย..`);
    }
}

function gacha(channel, user, amount) {
    let gachaLegendaryRate = 1;
    let gachaMysticRate = 10;
    let Bonus = 1;
    let killfeed_msg = "";
    if (amount == 0) return;

    let _player = player.getPlayerByUsername(user.username)
    if (_player && player.deductCoins(_player.username, amount)) {
        if (_player.coins == 0 && amount >= 10) {
            Bonus = 2;
        }

        if (roll(gachaLegendaryRate)) {
            let multiplier = (5 + Math.random() * 5 + botInfo.level / 100) * Bonus;
            let gain = parseInt(amount * multiplier);
            _player.coins += gain
            sessionPayout += gain - amount;
            if (Bonus != 1) {
                client.say(channel, `ALL-IN JACKPOT!! @${_player.username} ลงทุน ${amount} -> ได้รางวัล ${gain} armcoin. armKraab`);
                killfeed_msg = `<i class="fas fa-star"></i><b class="badge bg-primary">${_player.username}</b> <i class="fas fa-coins"></i> <b class="badge bg-danger">ALL-IN JACKPOT!!!</b> <i class="fas fa-level-up-alt"></i> ${gain} armcoin (${_player.coins})`;
                discordBot.sendEmbed("ALL-IN JACKPOT", `${_player.username} ลงทุน ${amount} -> ได้รางวัล ${gain} armcoin.` )
            } else {
                client.say(channel, `JACKPOT!! @${_player.username} ลงทุน ${amount} -> ได้รางวัล ${gain} armcoin. armKraab`);
                killfeed_msg = `<b class="badge bg-primary">${_player.username}</b> <i class="fas fa-coins"></i> JACKPOT!!! <i class="fas fa-level-up-alt"></i> ${gain} armcoin (${_player.coins})`;
                discordBot.sendEmbed("JACKPOT", `${_player.username} ลงทุน ${amount} -> ได้รางวัล ${gain} armcoin.` )
            }
        } else if (roll(gachaMysticRate, _player)) {
            let multiplier = 2 + Math.random() * 3 + botInfo.level / 100;
            let gain = parseInt(amount * multiplier);
            _player.coins += gain
            client.say(channel, `@${_player.username} ลงทุน ${amount} -> ได้รางวัล ${gain} armcoin.`);
            sessionPayout += gain - amount;
            killfeed_msg = `<b class="badge bg-primary">${_player.username}</b> <i class="fas fa-hand-holding-usd"></i> <i class="fas fa-level-up-alt"></i> ${gain} armcoin (${_player.coins})`;
            discordBot.sendEmbed("LUCKY!", `${_player.username} ลงทุน ${amount} -> ได้รางวัล ${gain} armcoin.` )
        } else {
            sessionIncome += amount;
            if (_player.coins == 0) {
                killfeed_msg = `<i class="far fa-grin-squint-tears"></i> <b class="badge bg-danger">หมดตัว</b> <b class="badge bg-danger">${_player.username}</b>  <i class="fas fa-user-injured"></i> <i class="fas fa-level-down-alt"></i> ${amount} armcoin`;
            } else {
                killfeed_msg = `<b class="badge bg-danger">${_player.username}</b> <i class="fas fa-user-injured"></i> <i class="fas fa-level-down-alt"></i> ${amount} armcoin (${_player.coins})`;
            }

        }

        webapp.socket.io().emit("widget::killfeed", {
            message: killfeed_msg,
        });
    } else {
        //timeoutUser(client.getChannel, user, botInfo.attackPower, `เล่นพนันไม่มีตังจ่าย ติดคุก`);
    }
}

function timeoutUser(channel, user, duration, reason) {

    // hard coded again. Need priviledge check.
    if (user.mod || player.isAdmin(user.username)) {
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
        client.say(channel, `@${user.username} ⚔️⚔️ CRITICAL!! รับโทษ x${botInfo.critMultiplier.toFixed(2)}`);
        webapp.socket.io().emit("widget::killfeed", {
            message: `<i class="fas fa-robot"></i> <b class="badge bg-info">${process.env.tmi_username}</b> <i class="fas fa-hammer"></i> <b class="badge bg-danger">CRITICAL!</b> <b>x${botInfo.critMultiplier}</b>`,
        });
    }
    final_duration = parseInt(final_duration);
    client.timeout(channel, user.username, final_duration, `${reason} (critRate = ${botInfo.critRate})`).catch((err) => {
        console.error(err);
    });

    webapp.socket.io().emit("widget::killfeed", {
        message: `<i class="fas fa-robot"></i> <b class="badge bg-info">${process.env.tmi_username}</b> <i class="fas fa-crosshairs"> </i>  <i class="fas fa-arrow-alt-circle-right"></i> <b class="badge bg-danger">${user.username}</b> (${final_duration})`,
    });
}

function handleChannelPoints(username, reward_id) {
    if (reward_id === "3a13ba8f-2a09-4765-abe0-7e028cdcaf28") { 
        player.giveCoins(username, 1);
        console.log(`${username} redeemed 1 armcoin`);
    }
    if (reward_id === "041ca23b-47b3-4d91-8fb9-d37f96c17f47") {
        player.giveCoins(username, 10);
        console.log(`${username} redeemed 10 armcoin`);
    }

    if (reward_id === "e22b1088-dfba-45a4-bcad-d79a8306ef7c") {
        player.giveCoins(username, 50);
        console.log(`${username} redeemed 50 armcoin`);
    }
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

client.on('message', (channel, tags, message, self) => {
    if (self) return;

    /* catch custom reward */
    if (tags["custom-reward-id"]) {
        handleChannelPoints(tags.username, tags["custom-reward-id"]);
    }

    /* mod can open/close the market. Allowing people to check/spend their coins. */
    if (tags.mod || player.isAdmin(tags.username)) {
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
            webapp.socket.io().emit("widget::market_dashboard", {
                key: MARKET_KEY.STATUS,
                data: {
                    marketOpen
                }
            });
            return;
        }

        let kick_command = message.split(" ");
        if (kick_command[0].toLowerCase() == "!kick") {
            // wrong command
            if (kick_command < 2) return;

            onKick(channel, kick_command.slice(1))
        }

        /* sentry mode is to toggle message filter on/off. */
        if (message == '!sentry') {
            sentryMode = !sentryMode;
            return
        }
    }

    /* Give coins to a user. Testing command, only available to me. */
    let give_re = /^!give\s*([A-Za-z0-9_]*)\s*(\d*)/;
    group = message.match(give_re);
    if (group && player.isAdmin(tags.username)) {
        if (group[1] && group[2]) {
            player.giveCoins(group[1], parseInt(group[2]))
        }
    }

    if (message == "!payday" && player.isAdmin(tags.username)) {
        giveCoins_allonline(1)
    }

    if (message == '!time') {
        let time = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
        client.say(channel, `เวลานายอาร์มตอนนี้คือ ${time}`);
        return;
    }
    if (message == '!github')
        client.say(channel, 'https://github.com/thananon/twitch_tools');

    /* MESSAGE FILTER:
       I added a low chance for timeout instead of kicking right away as chat will be full with
       kicking message and it is unpleasant. */

    if (sentryMode) {

        let wanttofly = /อยากบิน.*/;
        if (wanttofly.test(message)) {
            if (roll(50))
                timeoutUser(channel, tags, botInfo.attackPower, 'อยากบิน');
            return;
        }

        let intel =  /.*([il]\s*n\s*t\s*e\s*[lI]|อิ\s*น\s*เ\s*ท\s*ล).*/i;
        if (intel.test(message)) {
            timeoutUser(channel, tags, botInfo.attackPower, 'AMD');
        }
    }

    if (message == '!botstat') {
        client.say(channel, `<Level ${botInfo.level}> <EXP ${botInfo.exp}/${baseExp()}> <พลังโจมตี: ${botInfo.attackPower.toFixed(2)}> <%crit: ${botInfo.critRate.toFixed(2)}> <ตัวคูณ: ${botInfo.critMultiplier.toFixed(2)}> <Gacha Bonus +${botInfo.level}%>`);
        return;
    }

    /* reset bot stat */
    // Hard coded command for me. We will have to handle priviledge later.
    if (message == '!reset' && player.isAdmin(tags.username)) {
        botInfo.critRate = 5;
        botInfo.critMultiplier = 1.5;
        botInfo.attackPower = 300;
        botInfo.exp = 0;
        botInfo.level = 1;
        return;
    }

    /* for testing purpose */
    if (message == '!give' && player.isAdmin(tags.username)) {
        giveCoins_allonline(50).then(function (total) {
            client.say(channel, `gave ${total} users 50 coins.`);
        });
        return;
    }

    /* This should be fun, if its not broken. */
    if (message == '!thanos' && player.isAdmin(tags.username)) {
        thanos(channel, tags);
        return;
    }

    if (marketOpen || isSubscriber(tags)) {
        /* query amount of coin */
        if (message == '!coin') {
            let _player = player.getPlayerByUsername(tags.username)
            if (_player)
                client.say(channel, `@${_player.username} มี ${_player.coins} armcoin.`);
            else
                client.say(channel, `@${tags.username} มี 0 armcoin.`);
            return;
        }


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

        if (message == '!allin') {
            let _player = player.getPlayerByUsername(tags.username)
            if (_player) {
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

        /* Raffle -- lucky draw entry */
        let raffle_re = /^!raffle\s*(\d*)/;
        group = message.match(raffle_re);
        if (player.raffleOn && group) {
            let total = 0;
            if (!group[1])
                total = player.joinRaffle(tags.username, 1);
            else
                total = player.joinRaffle(tags.username, parseInt(group[1]));

            if (total == 0) {
                timeoutUser(channel, tags, 300, 'ไม่มีตังจ่ายค่าตั๋ว');
            } else { 
                webapp.socket.io().emit("widget::killfeed", {
                    message: `<b class="badge bg-primary">${tags.username}</b> ซื้อตั๋วชิงโชค ${total} ใบ`,
                });
            }
        }

        let auction_re = /^!auction\s*(\d*)/;
        group = message.match(auction_re);
        if (player.auctionOn && group) {
            let total = 0;
            if (group[1])
                if (player.auction(tags.username, parseInt(group[1]))) {
                    webapp.socket.io().emit("widget::killfeed", {
                        message: `<b class="badge bg-primary">${player.auctionLeader}</b> ประมูลสูงสุดที่ ${player.auctionBid} armcoin`,
                    });
                }
        }
    }

    if (message == '!income' && player.isAdmin(tags.username)) {
        client.say(channel, `Payout Total: ${sessionPayout} armcoin. Gacha Total = ${sessionIncome} Net: ${sessionIncome - sessionPayout}`);
    }

    if (message == '!save' && player.isAdmin(tags.username)) {
        saveBotData();
        player.saveData();
    }

    if (message == '!load' && player.isAdmin(tags.username)) {
        restoreBotData();
    }

    if (message == "!raffle start" && player.isAdmin(tags.username)){
        player.startRaffle(1);
        return;
    }

    if (message == "!raffle stop" && player.isAdmin(tags.username)){
        player.endRaffle();
        return;
    }

    if (message == "!draw" && player.isAdmin(tags.username)) {
        let winner = player.drawRaffle()

        webapp.socket.io().emit("widget::killfeed", {
            message: `<b class="badge bg-primary">${winner}</b> ได้รับรางวัล`,
        });
    }

    if (message == "!auction start" && player.isAdmin(tags.username)) {
        player.openAuction();
        return;
    }

    if (message == "!auction stop" && player.isAdmin(tags.username)) {
        player.closeAuction();
        webapp.socket.io().emit("widget::killfeed", {
            message: `<b class="badge bg-primary">${player.auctionLeader}</b> ชนะประมูลด้วยจำนวน ${player.auctionBid} armcoin`,
        });
        player.deductCoins(player.auctionLeader, player.auctionBid);
        return;
    }

});


async function onKick(channel, user) {
    kick_command = user;
    for (let i in kick_command) {
        let kick_user = kick_command[i]
        // username cannot start with an underscore _
        let kick = kick_user.match(/^@?[a-zA-Z0-9][\w]{2,24}$/);
        if (kick) {
            let user = {
                username: kick.input,
                isMod: false
            };
            // client.timeout(channel, kick.input, 10)
            // await sleep(700); // No need for this timeout as we wont kick that many people in a row. Thanos needs this because of rate limit about 100 kick/min.
            timeoutUser(channel, user, botInfo.attackPower, 'mod สั่งมา');
        }
    }
}
function subscriptionPayout (channel, username) {
    botInfo.critRate+=0.1;
    client.say(channel, `>> botInfo.critRate+0.1% ด้วยพลังแห่งทุนนิยม (${botInfo.critRate.toFixed(2)}%) <<`);
    player.giveCoins(username, 10);

    giveCoins_allonline(1).then(function (total) {
        client.say(channel, `${username} ได้รับ 10 armcoin จากการ subscribe และสมาชิก ${total} รายได้รับ 1 armcoin.`);

        webapp.socket.io().emit("widget::killfeed", {
            message: `<b class="badge bg-primary">${username}</b> ได้รับ <i class="fas fa-coins"></i> 10 armcoin จากการ Subscibe`,
        });

        webapp.socket.io().emit("widget::killfeed", {
            message: `<i class="fas fa-gift"></i> สมาชิก <b class="badge bg-info">${total}</b> คนได้รับ 1 armcoin <i class="fas fa-coins"></i> จากการ Subscribe ของ  <b class="badge bg-primary">${username}</b>`,
        });

    });
    player.giveCoins(username, 10)
}

function isSubscriber(userStat) {
    if (userStat.badges && "founder" in userStat.badges)
        return true;
    return userStat.subscriber
}

client.on('subscription', (channel, username, method, message, userstate) => {
    subscriptionPayout(channel, username);
});

client.on('resub', (channel, username, months, message, userstate, method) => {
    subscriptionPayout(channel, username);
});

client.on('subgift', (channel, username, streakmonth, recipient, methods, userstate) => {
    player.giveCoins(username, 10);
    subscriptionPayout(channel, recipient);
    client.say(channel, `${username} ได้รับ 10 armcoin จากการ Gift ให้ ${recipient} armKraab `);
});

client.on('submysterygift', (channel, username, num, method, userstate) => {
    if (!num) num = 1;
    player.giveCoins(username, 10 * num);
    client.say(channel, `${username} ได้รับ ${10 * num} armcoin จากการ Gift ให้สมาชิก ${num} คน armKraab `);

    webapp.socket.io().emit("widget::killfeed", {
        message: `<b class="badge bg-primary">${username}</b> ได้รับ <i class="fas fa-coins"></i> ${10 * num} armcoin จากการ gift sub x${num}`,
    });

});

client.on('cheer', (channel, userstate, message) => {

    let amt =  userstate.bits/10000;
    client.say(channel, `>> ตัวคูณเพิ่มขึ้น ${amt.toFixed(3)} จากพลังของนายทุน <<`);

    botInfo.critMultiplier += amt;

    webapp.socket.io().emit("widget::alerts", {
        itemKey: 2
    });
});

client.on('connected', (address, port) => {
    restoreBotData();
    setInterval(saveBotData, 60000);
    sentryMode = 0;
    console.log('Bot data restored...');
});
