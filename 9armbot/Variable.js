require('dotenv').config({ path: '.env' })

const pathDB = {
    bot: "./9armbot/db/botstat.json",
    user: "./9armbot/db/players.json"
}

const permission = {
    "ONWER": 0,
    "MOD": 1,
    "SUBSCRIBER": 2,
    "VIEWER": 3
}

const status = {
    "OPEN": true,
    "CLOSE": false
};

var session = {
    Payout: 0,
    Income: 0
};

var mode = {
    market: {
        mode: status.CLOSE
    },
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
        max: 500
    }
};

var botDialogue = {
    "Cheer": (temp => `>> ตัวคูณเพิ่มขึ้น ${temp.toFixed(2)} จากพลังของนายทุน <<`)
};


module.exports = { session, mode, botInfo, botDialogue, pathDB, permission, status };