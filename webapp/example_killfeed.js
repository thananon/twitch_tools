/**
 * Test send message every 3s and display GIF
 */

const webapp = require(".")
const Emitter = require('events');
const client = new Emitter();




/** test on receive message and show GIF */
client.on('message', (channel, tags, message, self) => {

    console.log(message)
    
    /** display gif, sound, message */
    webapp.socket.io().emit("widget::killfeed", message)

});



/** test loop send message like a tmi.js */
let messages = [
    {
        message : `<b>username</b> Test Text `
    },
    {
        message : `<b>username</b> <i class="fas fa-dollar-sign"></i> ทดสอบ`
    },
    {
        message : `<b>username</b> 💲💲💲 Test Text `
    },
    {
        message : `<b class="text-primary">username</b> ทดสอบ`
    },
    {
        message : `<b class="text-danger">username</b> Test Text `
    },
    {
        message : `<b class="badge bg-primary">username</b> ทดสอบ`
    }
];

let i = 0
setInterval(()=>{
    client.emit('message', "test_channel", "tags", messages[i], "self");
    i++
    if(i>=messages.length){
        i = 0;
    }
}, 1000)

console.log(`see GIF at ${webapp.url}/widgets/killfeed click -> 'Launch'`)