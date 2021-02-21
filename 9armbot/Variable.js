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

const gachaRate = {
    legendary: {
        rate: 2,
        initMultiplier: 5,
        multiplier: 5
    },
    mystic: {
        rate: 10,
        initMultiplier: 2,
        multiplier: 3
    },
    allin :{
        multiplier: 2
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

var user = {
    "LCKYN": {
        "amount": 100000000,
        "user-id": 85745201
    }
};

var userID = { 85745201: "LCKYN" };
const coinName = "armcoin";

var botDialogue = {
    "checkCoin": (_ => `@${_.username} มี ${_.amount.toLocaleString()} ${coinName}.`),
    "cheer": (_ => `>> ตัวคูณเพิ่มขึ้น ${_.toFixed(2)} จากพลังของนายทุน <<`),
    "gacha_all-in": (_ => `ALL-IN JACKPOT!! @${_.username} ลงทุน ${_.amount.toLocaleString()} -> ได้รางวัล ${_.gain.toLocaleString()} ${coinName}. armKraab`),
    "gacha_legendary": (_ => `JACKPOT!! @${_.username} ลงทุน ${_.amount.toLocaleString()} -> ได้รางวัล ${_.gain.toLocaleString()} ${coinName}. armKraab`),
    "gacha_mystic": (_ => `@${_.username} ลงทุน ${_.amount.toLocaleString()} -> ได้รางวัล ${_.gain.toLocaleString()} ${coinName}.`)
};


module.exports = { session, mode, botInfo, botDialogue, pathDB, permission, status, user, userID, gachaRate};