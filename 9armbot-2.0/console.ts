/**
 * 9armbot Console
 * Warning : Since this console toes not share the same process as the NodeJS server,
 *           writing to db will overwrite everything! (Singleton does not work across processes, damn!)
 */

import repl from 'repl'
import _ from 'lodash'
import { dbService } from './services/db'

const replServer = repl.start({
  prompt: `9armbot(${process.env.NODE_ENV || 'development'}) > `,
})

replServer.setupHistory('./.node_repl_history', () => {})

// Preload database
dbService.load()

console.log('Database loaded, press enter to continue.')

// Access db eg. `db.read()`
// Type `db.` then press Tab to see all available commands
replServer.context.db = dbService

// Lodash (_ is reserved, use l or __ instead)
replServer.context.l = _
replServer.context.__ = _
