import Discord from 'discord.js'

export async function discordService() {
  const client = new Discord.Client()

  client.on('ready', () => {
    console.log('Logged into Discord as ' + client.user!.tag)
  })

  await client.login(process.env.BOTV2_DISCORD_OAUTH_TOKEN)

  client.on('message', (msg) => {
    if (msg.author.bot) return

    // ! Commands
    switch (msg.content) {
      case '!github':
        msg.channel.send('https://github.com/thananon/twitch_tools')
        break
      default:
        break
    }
  })
}
