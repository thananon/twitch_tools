const tmi = require('tmi.js');
const fs = require('fs');

var oauth_token = fs.readFileSync('oauth_token', 'utf8');

var critRate = 5;
var superCritRate = 3;
var critMultiplier = 2.0;
var dodgeChance = 3;
var baseTimeoutSeconds = 600;

function timeoutUser(channel, user, duration, reason) {
    if (user.mod) {
        return;
    }
    let final_duration = duration;
    // roll perfect-dodge
    if (roll(dodgeChance)) {
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
        client.say(channel, `@${user.username} เป็นนายทุนจึงรับโทษเบา`);
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

    let re25 = /25.*25/;
    let re25_th = /๒๕.*๒๕/;
    if (re25.test(message) || re25_th.test(message)) {
        if (critRate < 100) {
            critRate++;
        } else {
            critRate = 0;
        }
        timeoutUser(channel, tags, baseTimeoutSeconds, 'เก่งคณิตศาสตร์');
    }

    let wanttofly = /อยากบิน.*/;
    if (wanttofly.test(message)) {
        timeoutUser(channel, tags, baseTimeoutSeconds, 'อยากบิน');
    }

    if (message == '!purge' && tags.username == 'armzi') {
        critRate = 10;
        critMultiplier = 2;
        client.say(channel, '(RESET) โอกาศติดคริ = '+critRate+'% ตัวคูณ = '+critMultiplier+'.');

    }

    if (message == '!crit')
        client.say(channel, 'โอกาศติดคริ = '+critRate+'% ตัวคูณ = '+critMultiplier+'.');
});



client.on('subscription', (channel, username, method, message, userstate) => {
    critMultiplier+=0.2;
    client.say(channel, 'ข้ารู้สึกถึงพลังที่เพิ่มขึ้น!! (critMultiplier = '+critMultiplier+').');
});

client.on('resub', (channel, username, months, message, userstate, method) => {
    critMultiplier+=0.2;
    client.say(channel, 'ข้ารู้สึกถึงพลังที่เพิ่มขึ้น!! (critMultiplier = '+critMultiplier+').');

});

client.on('cheer', (channel, userstate, message) => {
    let amt =  userstate.bits/1000;
    client.say(channel, `ตัวคูณเพิ่มขึ้น ${amt}...`);
    critMultiplier += amt;
});
