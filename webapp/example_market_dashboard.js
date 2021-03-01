/**
 * Test send message every 3s and display GIF
 */

var dayjs = require('dayjs')
const webapp = require('.')
const Emitter = require('events');
const client = new Emitter();
const { MARKET_KEY, GACHA_RATE_TYPE } = require('../core/market_dashboard')



/** test on receive message and show GIF */
client.on('message', (channel, tags, message, self) => {

    console.log(message)
    
    webapp.socket.io().emit("widget::market_dashboard", {
        key: MARKET_KEY.STATUS,
        data: {
            marketOpen:  message["itemKey"] % 2 === 0
          }
    })

    let amount = Math.floor(Math.random() * 10000) + 1;
    let gain = Math.round(Math.random() * 10000 + 1 * (Math.random()));

    webapp.socket.io().emit("widget::market_dashboard", {
        key: MARKET_KEY.TRANSACTION,
        data: {
            username: players[message["itemKey"]],
            amount,
            gain: gain,
            rate: gachaRate[message["itemKey"]],
            txnTime: dayjs().format("D MMM YYYY HH:mm:ss")
        }
    })

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
    GACHA_RATE_TYPE.MYSTIC
]



let i = 0
setInterval(()=>{
    client.emit('message', "test_channel", "tags", messages[i], "self");
    i++
    if(i>=messages.length){
        i = 0;
    }
}, 3000)

console.log(`see GIF at ${webapp.url}/widgets/market_dashboard click -> 'Launch'`)