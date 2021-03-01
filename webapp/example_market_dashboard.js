/**
 * Test send message every 3s and display GIF
 */

const webapp = require('.')
const Emitter = require('events');
const client = new Emitter();
const { MARKET_KEY } = require('../core/market_dashboard')



/** test on receive message and show GIF */
client.on('message', (channel, tags, message, self) => {

    console.log(message)
    
    /** display gif, sound, message */
    webapp.socket.io().emit("widget::market_dashboard", {
        key: MARKET_KEY.STATUS,
        data: {
            marketOpen:  message["itemKey"] % 2 === 0
          }
    })

});



/** test loop send message like a tmi.js */
let messages = [
    {
        itemKey : 0,
        message : "Hello"
    },
    {
        itemKey : 1,
        message : "สวัสดี"
    },
    {
        itemKey : 2,
        message : ""
    }
];

let i = 0
setInterval(()=>{
    client.emit('message', "test_channel", "tags", messages[i], "self");
    i++
    if(i>=messages.length){
        i = 0;
    }
}, 3000)

console.log(`see GIF at ${webapp.url}/widgets/market_dashboard click -> 'Launch'`)