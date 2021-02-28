const socketIO = require('socket.io');

var io;
const options = {
    /*cors: {
        origin: '*',
    }*/
};

module.exports = {
    listen: function (server) {
        io = socketIO(server, options);

        io.on('connection', socket => {

            socket.on('widget', (msg) => {
                io.emit(`widget::${msg.id}`, msg);
            });

        });

    },
    io: function () {
        return io;
    }
}