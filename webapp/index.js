/** create http and websocket */
const express = require('./services/express');
const socketIO = require('./services/socket.io');

const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";
const url = `http://${host}:${port}`

const server = require('http').createServer(express)
socketIO.listen(server);

server.listen(port, host, ()=>{
    console.log(`app listening at ${url}`)
});

module.exports = {
    express: express,
    socket: socketIO,
    port,
    host,
    url
}