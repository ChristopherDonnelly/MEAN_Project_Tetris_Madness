const xp = require("express");
const bp = require("body-parser");

const port = 8000;

const app = xp();

app.use(bp.json());
app.use(xp.static(__dirname + '/client/dist'));

require('./server/config/mongoose.js');
require('./server/config/routes.js')(app);

let users = [];
let games = [];

let gameQueue = {
    gameId: '',
    username: '',
    userSocket: ''
};

const server = app.listen(8000, () => { 
    console.log(`Server running on port #${port}`);
});

const io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    let myGameRoom;

    console.log("Client/socket is connected!");
    console.log("Client/socket id is: ", socket.id);

    socket.on('introMessage', (message) => {
        users.push({username: message.username, id: socket.id});
        socket.broadcast.emit('messageReceived', { class: "server_msg", title: 'Tetris Madness Server says: ', message: message.username + message.message });
    });

    socket.on('sendMessage', (message) => {
        io.emit('messageReceived', { title: message.username + ' says: ', message: message.message });
    });

    socket.on('createGame', (player) => {

        if(gameQueue.gameId==''){
            let val = (socket.id.length/4);
            let gameId = socket.id.substring(val, socket.id.length-val);
            
            console.log('Player: '+player.username+' created room: '+gameId);

            gameQueue.gameId = gameId;
            gameQueue.username = player.username;
            gameQueue.userSocket = socket.id;
            myGameRoom = room;

            socket.emit('gameInfo', gameQueue);

            var room = '/'+gameId;
            socket.nickname = room;
            socket.join(room);

        }else{
            var room = '/'+gameQueue.gameId;
            
            console.log('Player: '+player.username+' joined room: '+gameQueue.gameId);

            socket.nickname = room;
            socket.join(room);
            myGameRoom = room;
            socket.emit('gameInfo', gameQueue);

            socket.broadcast.to(room).emit('gameInfo', { gameId: gameQueue.gameId, username: player.username, userSocket: socket.id });

            io.sockets.in(room).emit('startGame');

            gameQueue = {
                gameId: '',
                username: '',
                userSocket: ''
            };
        }

    });

    socket.on('update', (data) => {
        socket.broadcast.to('/'+data.room_id).emit('updateOpponent', data);
    });

    socket.on('disconnect', function () {
        let currentUser = users.filter( obj => obj.id == socket.id )[0];
        // users = users.filter( obj => obj.id != socket.id );
        if(currentUser){
            if(myGameRoom) socket.broadcast.to(myGameRoom).emit('playerExit', { message: currentUser.username + ' has left the game.' });
            socket.broadcast.emit('messageReceived', { class: "server_msg", title: 'Tetris Madness Server says: ', message: currentUser.username + ' has left chat.' });
        }
    });
});