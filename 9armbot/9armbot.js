const tmi = require('tmi.js');
const fs = require('fs');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var oauth_token = fs.readFileSync('oauth_token', 'utf8');

var critRate = 5;
var critMultiplier = 1.5;
var dodgeRate = 3;
var baseTimeoutSeconds = 600;
var botExp = 0;
var botLevel = 1;

var purgeMode = 0;
const purgeList = new Map();

var sentryMode = 1;
var vengeanceMode=0;

var coins = {};

function deductCoins(user, amount) {
    if (coins[user] == undefined) {
        return false;
    }

    if (coins[user] < amount)
        return false;

    coins[user] -= amount;
    return true;
}


function giveCoins(users, amount) {

    let len = users.length;
    for (i=0;i<len;i++) {
        if (coins[users[i]] == undefined)
            coins[users[i]] = amount;
        else
            coins[users[i]] += amount;
        console.log(`${users[i]} has ${coins[users[i]]} coins.`);
    }
    console.log(`Gave out ${amount} coins to ${len} users.`);
    return len;
}

function feedBot(channel, user, amount) {
    if (deductCoins(user.username, amount)) {
        botExp += amount;
        if (botExp >= 500) { // level up
            botExp -= 500;
            baseTimeoutSeconds+=10;
            botLevel++;
            client.say(channel, `LEVEL UP!! ->${botLevel}`);
        }
    }
}


// return JSON: list of viewer's username.
function getOnlineUsers (channel) {
    //TODO: channel is currently hard-coded.
    let query_url = `https://tmi.twitch.tv/group/user/armzi/chatters`;
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", query_url, false); //synchronous
    xmlhttp.send();

    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        chatterJSON = JSON.parse(xmlhttp.responseText);
        return (chatterJSON['chatters']['viewers']);
    }
}

function thanos (channel, byUser) {
    let thanosCost = 30;
    let thanosTimeoutSeconds = 300;
    let casualties = 0;
    if (deductCoins(byUser.username, thanosCost) || byUser == 'armzi') {
        list = getOnlineUsers(channel);
        for(i=0; i<list.length;i++) {
            if (roll(50)){
                casualties++;
                // directly call timeout API as we dont want crit/dodge.
                client.timeout(channel, list[i], thanosTimeoutSeconds, `โดนทานอสดีดนิ้ว`);
            }
        }
        client.say(channel, `@${byUser.username} ใช้งาน Thanos Mode มี ${casualties} คนในแชทหายตัวไป....`);
    } else {
        timeoutUser(channel, byUser, baseTimeoutSeconds, `ค่าจ้างทานอส ${thanosCost} armcoin โว้ย..`);
    }
}

function gacha(channel, user, amount) {
    let gachaLegendaryRate = 5;
    let gachaMysticRate = 15;
    console.log(`gacha: ${channel}, ${user.username}, ${amount}`);
    if (deductCoins(user.username, amount)) {
        if (roll(gachaLegendaryRate)) {
            coins[user.username] += amount*10;
            client.say(channel, `@${user.username} ได้รางวัล ${amount*10} armcoin.`);
        } else if (roll(gachaMysticRate)) {
            coins[user.username] += amount*3;
            client.say(channel, `@${user.username} ได้รางวัล ${amount*3} armcoin.`);
        } else {
            client.say(channel, `🧂🧂🧂 @${user.username} 🧂 LUL🧂🧂🧂🧂`);
        }
    } else {
        timeoutUser(client.getChannel, user, baseTimeoutSeconds, `เล่นพนันไม่มีตังจ่าย ติดคุก`);
    }
}


function getPurgeList(channel) {
    const serverList = purgeList.get(channel);
    if(!serverList) {
		const purgeConstruct = {
            active: 0,
			users: []
		};
		purgeList.set(channel, purgeConstruct);
        return(purgeConstruct);
    } else {
        return(serverList);
    }
}

function timeoutUser(channel, user, duration, reason) {

    // hard coded again. Need priviledge check.
    if (user.mod || user.username == 'armzi' ) {
        return;
    }

    if (vengeanceMode)
        baseTimeoutSeconds+=10;

    if (purgeMode) {
        // add username to purge list and return;
        // TODO: This will be a problem when this bot is handling multiple channels.
        // but it will work for now.
        getPurgeList(channel).users.push(user.username);
        return;
    }

    let final_duration = duration;
    // roll perfect-dodge
    if (roll(dodgeRate)) {
        client.say(channel, `MISS!! ${user.username} หลบหลีกการโจมตี!`);
        return;
    }
    // roll crit
    if (roll(critRate)) {
        final_duration *= critMultiplier;
        client.say(channel, `@${user.username} ⚔️⚔️ CRITICAL!! รับโทษ x${critMultiplier}`);
    }

    if (user.subscriber) {
        final_duration /= 2;
        //client.say(channel, `@${user.username} เป็นนายทุนจึงรับโทษเบา`);
    }
    client.timeout(channel, user.username, final_duration, `${reason} (critRate = ${critRate})`).catch((err) => {
        console.log(err);
    });
}

function roll (critrate) {
    dice = Math.random() * 100;
    if (dice < critrate)
        return true;
    return false;
}

const client = new tmi.Client({
    options: { debug: true},
    connection: { reconnect: true },
    identity: {
        username: '9armbot',
        password: oauth_token,
    },
    channels: [ 'armzi' ]
});

client.connect();

client.on('message', (channel, tags, message, self) => {
    if (self) return;

    if (sentryMode) {
        if (/[2๒]\s*[5๕]\s*([*xX]|คูณ|multiply)\s*[2๒]\s*[5๕]/i.test(message)) {
            client.say(channel, '225 ไง Land Protector อะ');
            if (roll (15))
                timeoutUser(channel, tags, baseTimeoutSeconds, 'เก่งคณิตศาสตร์');
            return;
        }

        let wanttofly = /อยากบิน.*/;
        if (wanttofly.test(message)) {
            if (roll(50))
                timeoutUser(channel, tags, baseTimeoutSeconds, 'อยากบิน');
            return;
        }
    }

    if (message == '!botstat') {
        client.say(channel, `<Level ${botLevel}> <EXP ${botExp}/500> <พลังโจมตี: ${baseTimeoutSeconds}> <%crit: ${critRate}> <ตัวคูณ: ${critMultiplier}>`);
        return;
    }

    // Hard coded command for me. We will have to handle priviledge later.
    if (message == '!reset' && tags.username == 'armzi') {
        critRate = 10;
        critMultiplier = 2;
        baseTimeoutSeconds = 600;
        client.say(channel, '(RESET) โอกาศติดคริ = '+critRate+'% ตัวคูณ = '+critMultiplier+'.');
        return;
    }

    if (message == '!purgemode' && tags.username == 'armzi') {
        let serverList = getPurgeList(channel);
        if (serverList.active == 0) {
            serverList.active = 1;
            client.say(channel, '☠️☠️☠️ เปิดโหมดชำระล้าง.. ☠️☠️☠️');
        } else {
            let duration = baseTimeoutSeconds;
            let critUp = serverList.users.length /100;
            serverList.active = 0;
            client.say(channel, `☠️☠️เริ่มการชำระล้าง..☠️☠️' มีบันทึกในบัญชีหนังหมา ${serverList.users.length} รายการ`);
            if(roll(critRate)) {
                duration *= critMultiplier;
                client.say(channel,`CRITICAL PURGE! พลังโจมตี x${critMultiplier}`);
            }

            while (serverList.users.length) {
                let username = serverList.users.pop();
                client.timeout(channel, username, baseTimeoutSeconds, 'ถูกกำจัดในการชำระล้าง');
            }
            client.say(channel, `☠️☠️' ชำระล้างเสร็จสิ้น ตัวคูณเพิ่มขึ้น ${critUp} จากการชำระล้าง`);
            critMultiplier += critUp;
        }
        return;
    }

    if (tags.username == "armzi" && message == '!sentry') {
        if (sentryMode == 1) sentryMode = 0;
        else sentryMode = 1;
        return
    }

    if (message == '!give' && tags.username == "armzi") {
        //giveCoins(getOnlineUsers(channel), 1);
        client.say(channel, `สมาชิก ${giveCoins(getOnlineUsers(channel), 1)} รายได้รับ 1 armcoin`);
        return;
    }

    if (message == '!coin') {
        if (coins[tags.username])
            client.say(channel, `@${tags.username} มี ${coins[tags.username]} armcoin.`);
        else
            client.say(channel, `@${tags.username} มี 0 armcoin.`);
        return;
    }

    if (message == '!thanos') {
        thanos(channel, tags);
        return;
    }

    if (message == '!c') {
        coins['armzi'] = 999;
    }

    /* Gacha XXXX */
    let gacha_re = /^!gacha\s*(\d*)/;
    let group = message.match(gacha_re);
    if (group) {
        if (!group[1])
            gacha(channel, tags, 1);
        else
            gacha(channel, tags, parseInt(group[1]));
        return;
    }

    let feed_re = /^!feed\s*(\d*)/;
    group = message.match(feed_re);
    if (group) {
        if (!group[1])
            feedBot(channel, tags, 1);
        else
            feedBot(channel, tags, parseInt(group[1]));
    }


    if (message == '!vengeance' && tags.username == 'armzi') {
        if (vengeanceMode == 0) {
            vengeanceMode = 1;
            client.say(channel, `โหมดแค้น: บอทจะทรงพลังขึ้นทุกครั้งเมื่อโจมตี`);
        } else {
            vengeanceMode = 0;
            client.say(channel, `ไม่แค้นแล้วจ้า..`);
        }
        return;
    }
});

client.on('subscription', (channel, username, method, message, userstate) => {
    critRate+=2;
    client.say(channel, `>> critRate+2% ด้วยพลังแห่งทุนนิยม (${critRate}%) <<`);
    client.say(channel, `สมาชิก ${giveCoins(getOnlineUsers(channel), 1)} รายได้รับ 1 armcoin`);
    giveCoins(getOnlineUsers(channel), 1);
});

client.on('resub', (channel, username, months, message, userstate, method) => {
    critRate+=2;
    client.say(channel, `>> critRate+2% ด้วยพลังแห่งทุนนิยม (${critRate}%) <<`);
    client.say(channel, `สมาชิก ${giveCoins(getOnlineUsers(channel), 1)} รายได้รับ 1 armcoin`);
});

client.on('cheer', (channel, userstate, message) => {
    let amt =  userstate.bits/1000;
    client.say(channel, `>> ตัวคูณเพิ่มขึ้น ${amt} จากพลังของนายทุน <<`);
    critMultiplier += amt;
});


// We can do fun thing like bot getting stronger when more ppl join.
// client.on("join", (channel, username, self) => {
    // console.log(username);
// });
