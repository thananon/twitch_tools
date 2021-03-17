/**
 * Test send message every 3s and display GIF
 */

var dayjs = require('dayjs')
const webapp = require('.')
const Emitter = require('events');
const client = new Emitter();
const { MARKET_KEY, GACHA_RATE_TYPE } = require('../core/market_dashboard')

const gachaWinners = []
const MIN_WINNERS = 6

let topCoinPlayers = [
    {
        username: "Victor",
        coins: 99999999
    },
    {
        username: "Peter",
        coins: 100000
    },
    {
        username: "Mario",
        coins: 8888
    },
    {
        username: "Smith",
        coins: 111
    },
    {
        username: "Jones",
        coins: 11
    },

]


let previousTopCoinPlayers = [...topCoinPlayers]
let sessionIncome = 0
let sessionPayout= 0
let previousSessionIncome = 0
let previousSessionPayout= 0
/** test on receive message and show GIF */
client.on('message', (channel, tags, message, self) => {

    
    webapp.socket.io().emit("widget::market_dashboard", {
        key: MARKET_KEY.STATUS,
        data: {
            marketOpen:  message["itemKey"] % 2 === 0
          }
    })

    let amount = Math.floor(Math.random() * 10000) + 1;
    let gain = Math.round(Math.random() * 10000 + 1 * (Math.random()));
    let rateIcon = gachaRate[Math.floor(Math.random() * 4)]
    let txnPayload = {
        key: MARKET_KEY.TRANSACTION,
        data: {
            username: players[message["itemKey"]],
            amount,
            gain: gain,
            rate: rateIcon,
            timestamp: dayjs().unix(),
            txnTime: dayjs().format("D MMM YYYY HH:mm:ss")
        }
    }

    if([GACHA_RATE_TYPE.JACKPOT, GACHA_RATE_TYPE.ALL_IN_JACKPOT, GACHA_RATE_TYPE.MYSTIC].includes(rateIcon)){
        sessionPayout += gain - amount
    }else {
        sessionIncome += amount
    }

    webapp.socket.io().emit("widget::market_dashboard", txnPayload)
    
    let previousWinners = [...gachaWinners]
    if([GACHA_RATE_TYPE.ALL_IN_JACKPOT, GACHA_RATE_TYPE.JACKPOT].includes(txnPayload.data.rate)){
    const {username, amount, gain, rate, timestamp, txnTime} = txnPayload.data
        if(gachaWinners.length >= MIN_WINNERS){
            gachaWinners.shift()
        }

        gachaWinners.push({
            username,
            amount,
            gain,
            rate,
            timestamp,
            txnTime
        })
    }

    if(gachaWinners.length > 0){
        webapp.socket.io().emit("widget::market_dashboard", {
            key: MARKET_KEY.LATEST_WINNERS,
            data: {
                winners: gachaWinners
            }
        })
    }

    webapp.socket.io().emit("widget::market_dashboard", {
        key: MARKET_KEY.RICHEST_PLAYERS,
        data: {
            players: topCoinPlayers
        }
    })


    webapp.socket.io().emit("widget::market_dashboard", {
        key: MARKET_KEY.RICHEST_PLAYERS,
        data: {
            players: topCoinPlayers
        }
    })

    if(previousSessionIncome !== sessionIncome){
        previousSessionIncome = sessionIncome
        webapp.socket.io().emit("widget::market_dashboard", {
            key: MARKET_KEY.SESSION_INCOME,
            data: {
                timestamp:txnPayload.data.timestamp,
                txnTime: txnPayload.data.txnTime,
                income: sessionIncome
            }
        })
    }

    if( previousSessionPayout !== sessionPayout){
        previousSessionPayout = sessionPayout
        webapp.socket.io().emit("widget::market_dashboard", {
            key: MARKET_KEY.SESSION_PAYOUT,
            data: {
                timestamp:txnPayload.data.timestamp,
                txnTime: txnPayload.data.txnTime,
                payout: sessionPayout
            }
        })
    }



    console.log("🚀 ~  Gacha Transaction: ", txnPayload)
        
});



/** test loop send message like a tmi.js */
let messages = [
    {
        itemKey : 0,
    },
    {
        itemKey : 1,
    },
    {
        itemKey : 2,
    }
];

let players = ["Peter", "Victor", "Mario"]
let gachaRate = [
    GACHA_RATE_TYPE.SALT,
    GACHA_RATE_TYPE.ALL_IN_JACKPOT,
    GACHA_RATE_TYPE.MYSTIC,
    GACHA_RATE_TYPE.JACKPOT
]



let i = 0
setInterval(()=>{
    client.emit('message', "test_channel", "tags", messages[i], "self");
    i++
    if(i>=messages.length){
        i = 0;
    }
}, 2000)

console.log(`see GIF at ${webapp.url}/widgets/market_dashboard click -> 'Launch'`)
