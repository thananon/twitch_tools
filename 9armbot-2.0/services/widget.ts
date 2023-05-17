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

  displayGif(message: string, id: number, feedType: string = 'alerts') {
    console.log(`${message} ${id}`)

    this.socket.emit(this.getSocketName(feedType), {
      itemKey: id,
      message,
    })
  }

  feed(message: string, feedType: string = 'killfeed') {
    this.socket.emit(this.getSocketName(feedType), {
      id: feedType,
      message,
    })
  }

  testWidget(testMessage: string = 'test') {
    this.feed(
      `<b class="badge bg-primary">${testMessage}</b> <i class="fas fa-pizza-slice"></i>`,
    )
  }
}

export default Widget
