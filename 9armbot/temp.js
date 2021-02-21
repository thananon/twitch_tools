


let player = new Player();




async function giveCoins_allonline(amount) {
    let players = await player.getOnlinePlayers();
    for (let username of players) {
        player.giveCoins(username, amount)
    }
    console.log(`Gave out ${amount} coins to ${players.length} users.`);
    return players.length;
}




client.connect();

client.on("message", onMessageHandle);



function onMessageHandle(channel, userstate, message, self) {


    /* Give coins to a user. Testing command, only available to me. */
    let give_re = /^!give\s*([A-Za-z0-9_]*)\s*(\d*)/;
    group = message.match(give_re);
    if (group && checkBroadcaster(userstate)) {
        if (group[1] && group[2]) {
            player.giveCoins(group[1], parseInt(group[2]))
        }
    }

    /* for testing purpose */
    if (message == '!give' && checkBroadcaster(userstate)) {
        giveCoins_allonline(50).then(function (total) {
            client.say(channel, `gave ${total} users 50 coins.`);
        });
        return;
    }

    /* This should be fun, if its not broken. */
    if (message == '!thanos' && checkBroadcaster(userstate)) {
        thanos(channel, userstate);
        return;
    }

    if (message == '!save' && checkBroadcaster(userstate)) {
        saveBotData();
        player.saveData();
    }

    if (message == '!load' && checkBroadcaster(userstate)) {
        restoreBotData();
    }
}








function subscriptionPayout(channel, username) {
    botInfo.critRate += 2;
    client.say(channel, `>> botInfo.critRate+2% ด้วยพลังแห่งทุนนิยม (${botInfo.critRate}%) <<`);
    giveCoins_allonline(1).then(function (total) {
        client.say(channel, `${username} ได้รับ 10 armcoin จากการ subscribe และสมาชิก ${total} รายได้รับ 1 armcoin.`);
    });
    player.giveCoins(username, 10)
}

client.on('subscription', (channel, username, method, message, userstate) => {
    subscriptionPayout(channel, username);
});

client.on('resub', (channel, username, months, message, userstate, method) => {
    subscriptionPayout(channel, username);
});

client.on('subgift', (channel, username, streakmonth, recipient, methods, userstate) => {
    player.giveCoins(username, 10);
    client.say(channel, `${username} ได้รับ 10 armcoin จากการ Gift ให้ ${recipient} armKraab `);
});

client.on('submysterygift', (channel, username, streakmonth, num, method, userstate) => {
    if (!num) num = 1;
    player.giveCoins(username, 10 * num);
    client.say(channel, `${username} ได้รับ ${10 * num} armcoin จากการ Gift ให้สมาชิก ${num} คน armKraab `);
});

client.on('cheer', (channel, userstate, message) => {
    let amt = userstate.bits / 1000;
    client.say(channel, `>> ตัวคูณเพิ่มขึ้น ${amt} จากพลังของนายทุน <<`);
    botInfo.critMultiplier += amt;
});

client.on('connected', (address, port) => {
    restoreBotData();
    setInterval(saveBotData, 60000);
    sentryMode = 0;
    console.log('Bot data restored...');
});













function saveBotData() {
    data = JSON.stringify(botInfo);
    fs.writeFileSync('botstat.json', data, 'utf8');
}

function restoreBotData() {
    try {
        string = fs.readFileSync('botstat.json', 'utf8');
        botInfo = JSON.parse(string);
    } catch (err) {
        saveBotData();
    }
}