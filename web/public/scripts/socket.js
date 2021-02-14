// attempts to connect to 9armbot socket
const armbotSocket = io('ws://localhost:8085')

armbotSocket.on('connect', () => {
  console.log('conntected!')

  if (document.querySelector('#await-conn') !== null)
    document.querySelector('#await-conn').remove()
})

armbotSocket.on('disconnect', reason => {
  // create element if not exist
  if (document.querySelector('#await-conn') === null) {
    const divElement = document.createElement('div')
    divElement.id = 'await-conn'
    document.querySelector('#app').appendChild(divElement)
  }

  // inject message
  document.querySelector('#await-conn').textContent = `Disconnected! Reason: ${reason}`
})

armbotSocket.on('connect_error', err => {
  // create element if not exist
  if (document.querySelector('#await-conn') === null) {
    const divElement = document.createElement('div')
    divElement.id = 'await-conn'
    document.querySelector('#app').appendChild(divElement)
  }

  // inject message
  document.querySelector('#await-conn').textContent = 'Crash! Look for stacktrace in DevTools'
  console.error(err)
})

armbotSocket.on('playMedia', data => {
  console.log(data)
  // this line to garantee that payload will be object
  const payload = typeof data === 'string' ? JSON.parse(data) : data

  // play media?
  playPayload(payload)
})
