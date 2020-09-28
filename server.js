// Backend with Express and socket io
const path = require('path');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socketio = require('socket.io');
const port = process.env.PORT || 4000;
const io = socketio(server);

//use express.static to create middleware
app.use(express.static(path.resolve(__dirname, 'public')));
app.get('/', (req, res) => {    
    res.sendFile('index.html', {root: __dirname});
});

const interval = 2000;

//data from D-lab
event_connection = {
    Ev: 1,
    Num: 5
};

//run when client connects
io.on('connection', socket => {
    console.log('Client connected to server');
    //io.emit('event_connection', event_connection);

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    //sending d-lab data to client
    //socket.emit('event_connect', event_connection);
    socket.on('Ev', (ev) => {
        if (ev != 'hide') {
            event_connection.Ev = parseInt(ev.split(/(?!$)/u)[1]) - 1;
            // use io.emit for all clients or use socket.emit for a single client who passes the info.
            io.emit('event_connect', event_connection.Ev); 
            console.log('listen to: ', event_connection.Ev+1); 
        } else {
            io.emit('event_connect', 'hide');
        }
      
    })
});

server.listen(port, function() {
    console.log(`listening to requests on port ${port}`)
});