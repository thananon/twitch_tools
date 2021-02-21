


let player = new Player();




async function giveCoins_allonline(amount) {
    let players = await player.getOnlinePlayers();
    for (let username of players) {
        player.giveCoins(username, amount)
    }
    console.log(`Gave out ${amount} coins to ${players.length} users.`);
    return players.length;
}

function feedBot(channel, user, amount) {
    if (player.deductCoins(user.username, amount)) {
        botInfo.exp += amount;
        if (botInfo.exp >= 500) { // level up
            let levelup = parseInt(botInfo.exp / 500);
            botInfo.level += levelup;
            botInfo.exp %= 500;
            botInfo.attackPower += 10 * levelup;
            client.say(channel, `LEVEL UP!! -> ${botInfo.level}`);
        }
    }
}

async function thanos(channel, byUser) {
    let thanosCost = 3000;
    let thanosTimeoutSeconds = 180;
    let casualties = 0;
    console.log(`Thanos: I am inevitible..`)

    if (player.deductCoins(byUser.username, thanosCost) || checkBroadcaster(byUser)) {
        let players = await player.getOnlinePlayers()
        for (let user of players) {
            if (roll(50)) {
                casualties++;
                console.log(`${user.username} got snapped.`);
                client.timeout(channel, user.username, thanosTimeoutSeconds, `โดนทานอสดีดนิ้ว`);
                await new Utils().sleep(700)
            }
        }
        client.say(channel, `@${byUser.username} ใช้งาน Thanos Mode มี ${casualties} คนในแชทหายตัวไป....`);
    } else {
        //timeoutUser(channel, byUser, botInfo.attackPower, `ค่าจ้างทานอส ${thanosCost} armcoin โว้ย..`);
    }
}

function timeoutUser(channel, user, duration, reason) {

    // hard coded again. Need priviledge check.
    if (user.mod || player.isAdmin(user)) {
        return;
    }

    let final_duration = duration;
    // roll perfect-dodge
    if (roll(dodgeRate)) {
        client.say(channel, `MISS!! ${user.username} หลบหลีกการโจมตี!`);
        return;
    }
    // roll crit
    if (roll(botInfo.critRate)) {
        final_duration *= botInfo.critMultiplier;
        client.say(channel, );
    }

    client.timeout(channel, user.username, final_duration, `${reason} (critRate = ${botInfo.critRate})`).catch((err) => {
        console.error(err);
    });
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
    /*
        if (message == '!whisper') {
            console.log('whisper..');
            client.whisper(tags.username, 'test');
        }
    */

    /* reset bot stat */
    // Hard coded command for me. We will have to handle priviledge later.
    if (message == '!reset' && checkBroadcaster(userstate)) {
        botInfo.critRate = 5;
        botInfo.critMultiplier = 1.5;
        botInfo.attackPower = 300;
        botInfo.exp = 0;
        botInfo.level = 1;
        return;
    }

    /* sentry mode is to toggle message filter on/off. */
    if (checkBroadcaster(userstate) && message == '!sentry') {
        sentryMode = !sentryMode;
        return
    }

    /* for testing purpose */
    if (message == '!give' && checkBroadcaster(userstate)) {
        giveCoins_allonline(50).then(function (total) {
            client.say(channel, `gave ${total} users 50 coins.`);
        });
        return;
    }

    /* testing purpose, give myself bunch of coins */
    /*if (message == '!c') {
        player.giveCoins('armzi', 999999)
        return;
    }*/

    /* This should be fun, if its not broken. */
    if (message == '!thanos' && checkBroadcaster(userstate)) {
        thanos(channel, userstate);
        return;
    }

    if (marketOpen || checkSubscriber(userstate)) {
        /* query amount of coin */
        if (message == '!coin') {
            let _player = player.getPlayerByUsername(userstate.username)
            if (_player)
                client.say(channel, `@${_player.username} มี ${_player.coins} armcoin.`);
            else
                client.say(channel, `@${userstate.username} มี 0 armcoin.`);
            return;
        }


        /* usage: !gacha [amount] */
        /* We are trying to control the inflation. The return, on average should be a loss for users. */
        let gacha_re = /^!gacha\s*(\d*)/;
        let group = message.match(gacha_re);
        if (group) {
            if (!group[1])
                gacha(channel, userstate, 1);
            else
                gacha(channel, userstate, parseInt(group[1]));
            return;
        }

        if (message == '!allin') {
            let _player = player.getPlayerByUsername(userstate.username)
            if (_player) {
                gacha(channel, userstate, _player.coins);
            }
        }
        /* This command let user feed the bot with armcoin. */
        /* usage: !feed [amount] */
        let feed_re = /^!feed\s*(\d*)/;
        group = message.match(feed_re);
        if (group) {
            if (!group[1])
                feedBot(channel, userstate, 1);
            else
                feedBot(channel, userstate, parseInt(group[1]));
        }
    }

    if (message == '!income' && checkBroadcaster(userstate)) {
        client.say(channel, `Payout Total: ${sessionPayout} armcoin. Gacha Total = ${sessionIncome} Net: ${sessionIncome - sessionPayout}`);
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