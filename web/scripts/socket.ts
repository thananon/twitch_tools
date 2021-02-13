import { io } from 'socket.io-client'

import { Payload } from './@types/Payload'

// attempts to connect to 9armbot socket
const armbotSocket = io('ws://localhost/9armbot')

armbotSocket.on('connect', () => {
  console.log('conntected!')
})

armbotSocket.on('playMedia', data => {
  // this line to garantee that payload will be object
  const payload: Payload = typeof data === 'string' ? JSON.parse(data) : data

  // play media?
})

const mockPayload = {
  type: 'image',
  src: 'https://storage.rayriffy.com/files/image/manaka.jpg',
  size: {
    width: 125,
    height: 125,
  },
  position: {
    x: 200,
    y: 300,
  },
}
