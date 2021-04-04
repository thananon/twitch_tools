require('dotenv').config({ path: '../.env'});
const Discord = require("discord.js");
const Player = require('./player');
const fs = require('fs')


class discordBot {

    player = Player.getInstance()
    #discord_client = null
    #default_channel_id = "826104580898816002"

    constructor() {

    }

    getCoins(username) {
        let p = this.player.getOrNullPlayer(username);
        if (p) return p.coins
        return null
    }

    sendChat(channel_id, message) {
        this.#discord_client.channels.cache.get(channel_id).send(message);
    }

    showCoinsDialog(channel_id, username, amount) {
        const embed = new Discord.MessageEmbed()
                .addField(`<${username}>`, `มียอดคงเหลือ ${amount} armcoin`)
                .setFooter("Contribute @ github: https://github.com/thananon/twitch_tools")
        this.sendChat(channel_id, embed)
    }

    showLeaders(channel_id, leaders) {
        let embed = new Discord.MessageEmbed()
            .setTitle("กลุ่มผู้นำ armcoin")
            .setDescription("นายทุนผู้ถือเหรียญดิจิทัลที่มาแรงที่สุดในขณะนี้")

        leaders.forEach(user => {
            embed = embed.addField(user.username, user.coins, true)
        });

        embed = embed.setFooter("Contribute @ github: https://github.com/thananon/twitch_tools")
        embed = embed.setThumbnail('https://cdn.shopify.com/s/files/1/1955/3977/products/stonl_800x.png');
        this.sendChat(channel_id, embed)
    }

    showCoinsLeaderboard(channel_id) {
        let leaders = this.player.getPlayers("coins", "desc").slice(0, 9)
        this.showLeaders(channel_id, leaders)
    }

    showCommands(channel_id) {
        const embed = new Discord.MessageEmbed()
            .setTitle("9armbot on DISCORD!")
            .addField("!coin <twitch_username>", "แสดงยอด armcoin ของ twitch username นั้นๆ")
            .addField("!leader", "แสดงกลุ่มผู้ถือเหรียญ armcoin สูงสุด")
            .addField("!command", "แสดงข้อความนี้")
            .setFooter("Contribute @ github: https://github.com/thananon/twitch_tools")
        this.sendChat(channel_id, embed)
    }

    sendEmbed(title, message, channel_id = this.#default_channel_id) {
        const embed = new Discord.MessageEmbed()
            .addField(title, message)
        this.sendChat(channel_id, embed)
    }

    login(token) {
        this.#discord_client = new Discord.Client();
        this.#discord_client.on('ready', () => {
            console.log('Logged into Discord as ' + this.#discord_client.user.tag);
        });

        try {
            this.#discord_client.login(token)
        } catch(err) {
            console.log(err)
        }

        /* set message handler */
        this.#discord_client.on('message', async msg => {
            if (msg.author.bot)
                return;

            /* check coin amount */
            let group = msg.content.match(/!coin\s+([a-zA-Z0-9_]*)/)
            if (group && group[1]) {
                group[1] = group[1].toLowerCase();
                let coin = this.getCoins(group[1])
                if (coin) {
                    this.showCoinsDialog(msg.channel.id, group[1], coin)
                } else {
                    this.sendChat(msg.channel.id, `ไม่พบ username <${group[1]}> โปรดใส่ Twitch username..`)
                }
                return
            }

            if (msg.content == "!coin") {
                this.sendChat(msg.channel.id, "ใส่ username ของ twitch สิวะ ไม่บอกแล้วจะไปรู้ได้ไงว่า id twitch เอ็งคืออะไร คิดดิคิด...")
            }

            if (msg.content == "!command") {
                this.showCommands(msg.channel.id)
            }

            /* Query leader board */
            if (msg.content === "!leader") {
                this.showCoinsLeaderboard(msg.channel.id)
            }
        });
    }
}
module.exports = discordBot


// gacha-log: 826104580898816002
// 9armbot: 826104125531357234
/* only respond in monitored channels */




