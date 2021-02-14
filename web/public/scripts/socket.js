// attempts to connect to 9armbot socket
const armbotSocket = io('ws://localhost:8085')

armbotSocket.on('connect', () => {
  console.log('conntected!')
  try {
    document.querySelector('#await-conn').remove()
  } catch {
    console.warn('Cannot find #await-conn to remove, maybe it already gone???')
  }
})

armbotSocket.on('playMedia', data => {
  console.log(data)
  // this line to garantee that payload will be object
  const payload = typeof data === 'string' ? JSON.parse(data) : data

  // play media?
  playPayload(payload)
})
