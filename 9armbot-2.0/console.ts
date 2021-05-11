/**
 * 9armbot Console
 *   Features:
 *   - db : Database Service [services/db.ts]
 *   - bot : Bot Service [services/bot.ts]
 */

import repl from 'repl'
import _ from 'lodash'
import { Db } from './services/db'
import commands from './services/bot'
import Player from './services/models/player'
import Widget from './services/widget'
import Setting from './services/setting'

const replServer = repl.start({
  prompt: `9armbot(${process.env.NODE_ENV || 'development'}) > `,
})

replServer.setupHistory('./.node_repl_history', () => {})

const db = new Db()
const widget = new Widget(true)

const dbName = process.env.DATABASE_URL!.split(':')[1]
console.log(`Database "${dbName}" loaded, press enter to continue.`)

// Access db eg. `await db.read()`
//   Since it is asynchronous function you have to use await keyword.
//   Type `db.` then press Tab to see all available commands
replServer.context.db = db
replServer.context.Player = Player

// Bot commands eg. `await bot.coin(username)`
replServer.context.bot = commands

// Widget commands eg. `widget.testWidget()`
replServer.context.widget = widget

Setting.init().then((setting) => {
  setting.startAutoSync(false)
  replServer.context.setting = setting
})

// Lodash (_ is reserved, use l or __ instead)
replServer.context.l = _
replServer.context.__ = _
