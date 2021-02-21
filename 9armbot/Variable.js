require('dotenv').config({ path: '.env' })

const pathDB = {
    bot: "./9armbot/db/botstat.json",
    user: "./9armbot/db/players.json"
}

// enum permission, status
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
        status: status.CLOSE
    },
    sentry: {
        status: status.CLOSE,
        chance25: 15,
        chanceFly: 50,
        dodgeRate: 1
    }
};

// bad naming?
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
    allin: {
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
    "bot_stat": (_ => `<Level ${_.level.toLocaleString()}> <EXP ${_.exp}/500> <พลังโจมตี: ${_.attackPower.toLocaleString()}> <%crit: ${_.critRate}> <ตัวคูณ: ${_.critMultiplier}> <Gacha Bonus +${_.level.toLocaleString()}%>`),
    "check_coin": (_ => `@${_.username} มี ${_.amount.toLocaleString()} ${coinName}.`),
    "cheer": (_ => `>> ตัวคูณเพิ่มขึ้น ${_.toFixed(2)} จากพลังของนายทุน <<`),
    "feed_bot_level_up": (_ => `LEVEL UP!! -> ${_}`),
    "gacha_all-in": (_ => `ALL-IN JACKPOT!! @${_.username} ลงทุน ${_.amount.toLocaleString()} -> ได้รางวัล ${_.gain.toLocaleString()} ${coinName}. armKraab`),
    "gacha_legendary": (_ => `JACKPOT!! @${_.username} ลงทุน ${_.amount.toLocaleString()} -> ได้รางวัล ${_.gain.toLocaleString()} ${coinName}. armKraab`),
    "gacha_mystic": (_ => `@${_.username} ลงทุน ${_.amount.toLocaleString()} -> ได้รางวัล ${_.gain.toLocaleString()} ${coinName}.`),
    "github": "https://github.com/thananon/twitch_tools",
    "income": (_ => `Payout Total: ${_.Payout.toLocaleString()} ${coinName}. Gacha Total = ${_.Income.toLocaleString()} ${coinName}. Net: ${_.diff.toLocaleString()} ${coinName}.`),
    "sentry25": "225 ไง Land Protector อะ",
    "sentry_dodge": (_ => `MISS!! ${_} หลบหลีกการโจมตี!`),
    "sentry_mode": (_ => `${_.username} ${_.state}การทำงานของ sentry`),
    "sentry_timeout": (_ => `${_} (critRate = ${_.critRate})`),
    "sentry_timeout_crit": (_ => `@${_.username} ⚔️⚔️ CRITICAL!! รับโทษ x${_.critMultiplier}`)
};


module.exports = { session, mode, botInfo, botDialogue, pathDB, permission, status, user, userID, gachaRate };