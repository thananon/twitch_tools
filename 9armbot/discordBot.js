const fs = require('fs');
const io = require("socket.io-client");
const socket = io("ws://localhost:3000");
const Discord = require('discord.js');
const client = new Discord.Client();

const BotToken = fs.readFileSync('discord_token', 'utf8');

const prefix = '!';
const allowedChannels = ['600316093872996382'];

client.on('ready', () => {
    console.log('Discord bot started');
});

client.on('message', message => {
    if (message.author.bot) return;
    if (message.content.indexOf(prefix) !== 0) return;
    if (!allowedChannels.includes(message.channel.id)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command == 'command') {
        const embed = new Discord.MessageEmbed()
            .setTitle("9armbot on DISCORD!")
            .addField("!coin <twitch_username>", "แสดงยอด armcoin ของ twitch username นั้นๆ")
            .addField("!leader", "แสดงกลุ่มผู้ถือเหรียญ armcoin สูงสุด")
            .addField("!command", "แสดงข้อความนี้")
            .setFooter("Contribute @ github: https://github.com/thananon/twitch_tools")
        message.channel.send(embed);
    }

    if (command == 'coin') {
        if (args[0] == undefined) {
            message.channel.send('ใส่ username ของ twitch สิวะ ไม่บอกแล้วจะไปรู้ได้ไงว่า id twitch เอ็งคืออะไร คิดดิคิด...');
            return;
        }

        var _twitchUsername = args[0];
        socket.emit("getTwitchCoinsByUsername", {
            twitchUsername: _twitchUsername,
            channelID: message.channel.id
        });
    }

    if (command == 'leader') {
        socket.emit("getTopTwitchCoins", {
            channelID: message.channel.id
        });
    }
});

socket.on("getTwitchCoinsByUsername", (data) => {
    var channel = client.channels.cache.get(data.data.channelID);

    if (data.success == true) {
        var amount = data.data.coins;
        var twitchUsername = data.data.twitchUsername;

        const embed = new Discord.MessageEmbed()
            .addField(`<${twitchUsername}>`, `มียอดคงเหลือ ${amount} armcoin`)
            .setFooter("Contribute @ github: https://github.com/thananon/twitch_tools")
        channel.send(embed);
    } else {
        channel.send(data.cause);
    }
});

socket.on("getTopTwitchCoins", (data) => {
    var channel = client.channels.cache.get(data.data.channelID);

    let embed = new Discord.MessageEmbed()
        .setTitle("กลุ่มผู้นำ armcoin")
        .setDescription("นายทุนผู้ถือเหรียญดิจิทัลที่มาแรงที่สุดในขณะนี้")

    data.data.leaders.forEach(user => {
        embed = embed.addField(user.twitchUsername, user.wallets.twitch, true)
    });

    embed = embed.setFooter("Contribute @ github: https://github.com/thananon/twitch_tools")
    embed = embed.setThumbnail('https://cdn.shopify.com/s/files/1/1955/3977/products/stonl_800x.png');
    channel.send(embed);
});

client.login(BotToken);