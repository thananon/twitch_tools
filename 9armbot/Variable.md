

const address 

const headers

const permission 

const status 

var session 

var mode 

// bad naming?
const gachaRate 

var botInfo

var user

var userID
const coinName

const thanos

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
    "sentry_timeout_crit": (_ => `@${_.username} ⚔️⚔️ CRITICAL!! รับโทษ x${_.critMultiplier}`),
    "thanos_activated": "ข้าคือชะตาที่ไม่อาจหลีกเลี่ยง",
    "thanos_inevitible": "คุณสตาร์ค ผมรู้สึกไม่ค่อยสบาย "
};


module.exports = { session, mode, botInfo, botDialogue, address, permission, status, user, userID, gachaRate, thanos, headers};