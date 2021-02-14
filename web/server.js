const fs = require('fs')
const path = require('path')

const server = require('http').createServer((req, res) => {
  try {
    const file = fs.readFileSync(path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url))

    res.writeHead(200)
    res.end(file)
  } catch (err) {
    res.writeHead(404)
    res.end(JSON.stringify(err))
    return
  }
})

server.listen(1234, () => {
  console.log('Web interface is running at http://localhost:1234')
})
