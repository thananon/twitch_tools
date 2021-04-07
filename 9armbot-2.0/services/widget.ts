import webapp from '../../webapp'

export function testWidget() {
  webapp.socket.io().emit('widget::killfeed', {
    message: `<b class="badge bg-primary">test</b> <i class="fas fa-pizza-slice"></i>`,
  })
}
