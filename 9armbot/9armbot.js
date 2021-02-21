// require('dotenv').config({ path: '.env' })
const tmi = require('tmi.js');
// const fs = require('fs');
// var oauth_token = fs.readFileSync('oauth_token', 'utf8');
const Utils = require('../core/utils')
// const Player = require('./player')

// .toLocaleString()

const { address, permission, status, gachaRate, thanos } = require("./Variable.js");
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
    "!f": feedBot,
    "!g": gacha,
    "!git": githubLink,

    "!allin": gacha,
    "!botstat": getBotStat,
    "!coin": checkCoin,
    "!feed": feedBot,
    "!gacha": gacha,
    "!github": githubLink,
    "!income": getIncome,
    "!reset": resetBot,
    "!sentry": toggleStateSentry,
    "!thanos": thanosClick
}

// client event 
function onMessageHandler(channel, userstate, message, self) {
    if (self) return;

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
    else if (mode.sentry.status == status.OPEN)
        sentryMode(state);
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
            "user-id": id,
            "feed": 0
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
    if (!(getPermissionOf(state.userstate) < 3 || mode.market.status == status.OPEN)) return;
    const username = state.userstate["display-name"];

    checkNewUser(state.userstate);

    const amount = user[username]["amount"];
    let tempParameter = {
        username: username,
        amount: amount
    };

    client.say(state.channel, botDialogue["check_coin"](tempParameter));
}

function gacha(state) {
    // allow owner mod sub or market is open
    if (!(getPermissionOf(state.userstate) < 3 || mode.market.status == status.OPEN)) return;
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

    const getLegendary = chance < gachaRate.legendary.rate;
    const getMystic = chance < gachaRate.mystic.rate;

    // calculate multiplier
    // legendary
    if (getLegendary) {
        multiplier = gachaRate.legendary.initMultiplier;
        multiplier += Math.random() * gachaRate.legendary.multiplier;
    }// mystic
    else if (getMystic) {
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

function githubLink(state) {
    client.say(state.channel, botDialogue["github"]);
}

function sentryMode(state) {
    const message = state.message;
    let username = state.userstate["display-name"];

    const regex25 = /[2๒]\s*[5๕]\s*([*xX]|คูณ|multiply)\s*[2๒]\s*[5๕]/i;
    const regexfly = /อยากบิน.*/;

    const chance25 = Math.random() * 100 < mode.sentry.chance25;
    const chanceFly = Math.random() * 100 < mode.sentry.chanceFly;
    const dodge = Math.random() * 100 < mode.sentry.dodgeRate;
    const crit = Math.random() * 100 < botInfo.crit.rate;
    let duration = botInfo.attackPower;
    let reason = "";

    // filter message
    if (regex25.test(message)) {
        client.say(state.channel, botDialogue["sentry25"]);

        if (chance25)
            reason = "เก่งคณิตศาสตร์";
    }
    if (regexfly.test(message)) {
        if (chanceFly)
            reason = "อยากบิน";
    }

    if (reason == "") return;

    const tempParameter = {
        username: username,
        critMultiplier: botInfo.crit.multiplier,
        critRate: botInfo.crit.rate
    };

    // get perfect-dodge ?
    if (dodge) {
        client.say(state.channel, botDialogue["sentry_dodge"](username));
    } else if (crit) {
        duration *= botInfo.crit.multiplier;
        client.timeout(state.channel, username, duration, botDialogue["sentry_timeout_crit"](tempParameter)).catch((err) => { console.error(err); });
    } else {
        client.timeout(state.channel, username, duration, botDialogue["sentry_timeout"](tempParameter)).catch((err) => { console.error(err); });
    }
}

function getBotStat(state) {
    const tempParameter = {
        level: botInfo.level,
        exp: botInfo.exp.current,
        attackPower: botInfo.attackPower,
        critRate: botInfo.crit.rate,
        critMultiplier: botInfo.crit.multiplier
    }

    client.say(state.channel, botDialogue["bot_stat"](tempParameter));
}

function resetBot(state) {
    // only owner
    if (getPermissionOf(state.userstate) == 0) {
        botInfo = {
            level: 1,
            attackPower: 300,
            crit: {
                rate: 5,
                multiplier: 1.5
            },
            exp: {
                current: 0,
                max: 500
            }
        };
        getBotStat(state);
    }
}

function toggleStateSentry(state) {
    // only owner
    const username = state.userstate["display-name"];
    if (getPermissionOf(state.userstate) == 0) {
        if (mode.sentry.status == status.OPEN)
            mode.sentry.status = status.CLOSE;
        else
            mode.sentry.status = status.OPEN;

        const tempText = {
            username: username,
            state: mode.sentry.status ? "เปิด" : "ปิด"
        };
        client.say(state.channel, botDialogue["sentry_mode"](tempText));
    }
}

function feedBot(state) {
    const username = state.userstate["display-name"];
    const message = state.message;

    const regexFeed = /^!feed\s*(\d*)/;
    const group = message.match(regexFeed);

    let amount = 0;
    if (group) {
        if (!group[1])
            amount = 1;
        else
            amount = parseInt(group[1]);
    }
    const sufficient = user[username].amount >= amount && amount > 0;
    const levelUP = botInfo.exp.current + amount >= botInfo.exp.max;

    if (sufficient) {
        botInfo.exp.current += amount;
        user[username].feed += amount;
        user[username].amount -= amount;
        // lever up
        if (levelUP) {
            const levelGain = parseInt(botInfo.exp.current / 500)

            botInfo.level += levelGain;
            botInfo.exp.current %= 500;
            botInfo.attackPower += 10 * levelGain;
            client.say(state.channel, botDialogue["feed_bot_level_up"](botInfo.level));
        }
    }

}

function getIncome(state) {
    // only owner
    if (getPermissionOf(state.userstate) == 0) {
        const tempParameter = {
            Payout: session.Payout,
            Income: session.Income,
            diff: session.Income - session.Payout
        };
        client.say(state.channel, botDialogue["income"](tempParameter));
    }
}

async function thanosClick(state) {



    const username = state.userstate["display-name"];
    const userAmount = user[username].amount;

    const isOwner = getPermissionOf(state.userstate) == 0;
    const powerfulEnough = (isOwner || userAmount >= thanos.Cost);


    if (powerfulEnough) {
        console.log(`Thanos: I am inevitible..`);
        client.say(state.channel, botDialogue["thanos_activated"]);

        if (!isOwner)
            user[username].amount -= thanos.Cost;

        client.api({
            // url: address.URLchatter(state.channel.slice(1))
            url: address.URLchatter("armzi")
        }, async (err, res, body) => {
            let disappear = 0;
            const viewerList = body.chatters.viewers;


            for (let i in viewerList) {
                const inevitible = Math.random() * 100 < 50;
                if (inevitible) {
                    disappear += 1;
                    client.say(state.channel, viewerList[i]);
                    console.log(viewerList[i]);
                    await new Utils().sleep(700);
                }

            }
            client.say(state.channel, `@${username} ใช้งาน Thanos Mode มี ${disappear} คนในแชทหายตัวไป....`);

        });
    }
}
