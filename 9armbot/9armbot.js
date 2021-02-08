const tmi = require('tmi.js');
const fs = require('fs');

var oauth_token = fs.readFileSync('oauth_token', 'utf8');

var critRate = 5;
var critMultiplier = 1.5;
var dodgeRate = 3;
var baseTimeoutSeconds = 600;

var vengeanceMode=0;

var purgeMode = 0;
const purgeList = new Map();

function getPurgeList(channel) {
    const serverList = purgeList.get(channel);
    if(!serverList) {
		const purgeConstruct = {
            active: true,
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

    if (/[2๒].*[5๕].*[2๒].*[5๕]/.test(message)) {
        timeoutUser(channel, tags, baseTimeoutSeconds, 'เก่งคณิตศาสตร์');
    }

    let wanttofly = /อยากบิน.*/;
    if (wanttofly.test(message)) {
        timeoutUser(channel, tags, baseTimeoutSeconds, 'อยากบิน');
    }

    if (message == '!botstat')
        client.say(channel, `<พลังโจมตี: ${baseTimeoutSeconds}> <%crit: ${critRate}> <ตัวคูณ: ${critMultiplier}>`);

    // Hard coded command for me. We will have to handle priviledge later.
    if (message == '!reset' && tags.username == 'armzi') {
        critRate = 10;
        critMultiplier = 2;
        baseTimeoutSeconds = 600;
        client.say(channel, '(RESET) โอกาศติดคริ = '+critRate+'% ตัวคูณ = '+critMultiplier+'.');
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
    }

    if (message == '!vengeance' && tags.username == 'armzi') {
        if (vengeanceMode == 0) {
            vengeanceMode = 1;
            client.say(channel, `โหมดแค้น: บอทจะทรงพลังขึ้นทุกครั้งเมื่อโจมตี`);
        } else {
            vengeanceMode = 0;
            client.say(channel, `ไม่แค้นแล้วจ้า..`);
        }
    }
});

client.on('subscription', (channel, username, method, message, userstate) => {
    critRate+=2;
    client.say(channel, `>> critRate+2% ด้วยพลังแห่งทุนนิยม (${critRate}%) <<`);
});

client.on('resub', (channel, username, months, message, userstate, method) => {
    critRate+=2;
    client.say(channel, `>> critRate+2% ด้วยพลังแห่งทุนนิยม (${critRate}%) <<`);
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
