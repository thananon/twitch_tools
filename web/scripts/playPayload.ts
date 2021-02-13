import { Payload } from './@types/Payload'

const wait = duration => new Promise(res => setTimeout(res, duration))

export const playPayload = async (payload: Payload, duration = 5000) => {
  if (payload.type === 'image') {
    const imageElement = document.createElement('img')

    imageElement.src = payload.src
    if (Number.isSafeInteger(payload.size.width)) imageElement.width = payload.size.width
    if (Number.isSafeInteger(payload.size.height)) imageElement.height = payload.size.height
    imageElement.style.position = 'absolute'
    imageElement.style.top = `${payload.position.y}px`
    imageElement.style.left = `${payload.position.x}px`
    imageElement.style.transition = 'all 0.6s ease-in-out'
    imageElement.style.opacity = '0'

    document.querySelector('div#app').appendChild(imageElement)
    await wait(10)
    imageElement.style.opacity = '1'

    // transition and remove element away when playback is complete
    setTimeout(async () => {
      imageElement.style.opacity = '0'
      await wait(600)
      imageElement.remove()
    }, duration)
  } else if (payload.type === 'video') {
    const videoElement = document.createElement('video')

    videoElement.src = payload.src
    if (Number.isSafeInteger(payload.size.width)) videoElement.width = payload.size.width
    videoElement.style.height = Number.isSafeInteger(payload.size.height) ? payload.size.height.toString() : 'auto'
    videoElement.style.position = 'absolute'
    videoElement.style.top = `${payload.position.y}px`
    videoElement.style.left = `${payload.position.x}px`
    videoElement.style.transition = 'all 0.6s ease-in-out'
    videoElement.style.opacity = '0'

    // video must be muted to be able to play automatically
    videoElement.autoplay = true
    videoElement.muted = true
    videoElement.loop = true

    document.querySelector('div#app').appendChild(videoElement)
    await wait(10)
    videoElement.style.opacity = '1'

    // transition and remove element away when playback is complete
    setTimeout(async () => {
      videoElement.style.opacity = '0'
      await wait(600)
      videoElement.remove()
    }, duration)
  }
}
