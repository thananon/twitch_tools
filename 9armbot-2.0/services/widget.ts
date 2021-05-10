import io from 'socket.io-client'

const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'
const url = `ws://${host}:${port}`

class Widget {
  private socket: any
  private clientOnly: boolean

  constructor(clientOnly = true) {
    this.clientOnly = clientOnly

    if (clientOnly) {
      console.log('Connecting to SocketIO server', url)
      this.socket = io(url)
    } else {
      const webapp = require('../../webapp')
      this.socket = webapp.socket.io()
    }

    this.socket.on('connect_error', (err: Error) => {
      console.log(`connect_error due to ${err.message}`)
    })
  }

  private getSocketName(name: string): string {
    // What sorcery is this???
    return this.clientOnly ? 'widget' : `widget::${name}`
  }

  testWidget(message: string = 'test') {
    this.socket.emit(this.getSocketName('killfeed'), {
      id: 'killfeed',
      message: `<b class="badge bg-primary">${message}</b> <i class="fas fa-pizza-slice"></i>`,
    })
  }
}

export default Widget
