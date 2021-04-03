/**
 * 9armbot Console
 *   Features:
 *   - db : Database Service [services/db.ts]
 */

import repl from 'repl'
import _ from 'lodash'
import { Db } from './services/db'

const replServer = repl.start({
  prompt: `9armbot(${process.env.NODE_ENV || 'development'}) > `,
})

replServer.setupHistory('./.node_repl_history', () => {})

const db = new Db()

const dbName = process.env.DATABASE_URL!.split(':')[1]
console.log(`Database "${dbName}" loaded, press enter to continue.`)

// Access db eg. `await db.read()`
//   Since it is asynchronous function you have to use await keyword.
//   Type `db.` then press Tab to see all available commands
replServer.context.db = db

// Lodash (_ is reserved, use l or __ instead)
replServer.context.l = _
replServer.context.__ = _