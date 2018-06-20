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
    userId: ''
};

const server = require('http').createServer(app);

const io = require('socket.io')(server); //require('socket.io').listen(server);

console.log(io);

io.on('connection', function (socket) {
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
            let gameId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            let room = '/'+gameId;
            myGameRoom = room;
            
            socket.broadcast.emit('messageReceived', { class: "server_msg", title: 'Tetris Madness Server says: ' + player.username + ' started a new game!' });
            console.log('Player: '+player.username+' created room: '+gameId);

            gameQueue.gameId = gameId;
            gameQueue.username = player.username;
            gameQueue.userId = player._id;

            socket.emit('gameInfo', { gameId: gameQueue.gameId, username: 'waiting', userId: 'waiting' });

            socket.nickname = room;
            socket.join(room);

        }else{
            var room = '/'+gameQueue.gameId;
            myGameRoom = room;
            
            socket.broadcast.emit('messageReceived', { class: "server_msg", title: 'Tetris Madness Server says: ' + player.username + ' joined a game!' });
            console.log('Player: '+player.username+' joined room: '+gameQueue.gameId);

            socket.nickname = room;
            socket.join(room);

            socket.emit('gameInfo', gameQueue);

            socket.broadcast.to(room).emit('gameInfo', { gameId: gameQueue.gameId, username: player.username, userId: player._id });

            io.sockets.in(room).emit('startGame');

            gameQueue = {
                gameId: '',
                username: '',
                userId: ''
            };
        }
    });

    socket.on('endGame', (data) => {
        socket.broadcast.to(myGameRoom).emit('opponentLost', data);
    });

    socket.on('sabotage', (data) => {
        socket.broadcast.to(myGameRoom).emit('addSabotage', data);
    });

    socket.on('update', (data) => {
        socket.broadcast.to('/'+data.room_id).emit('updateOpponent', data);
    });

    socket.on('disconnect', function () {
        let currentUser = users.filter( obj => obj.id == socket.id )[0];
        // users = users.filter( obj => obj.id != socket.id );
        if(currentUser){
            console.log(myGameRoom)
            if(myGameRoom){
                socket.broadcast.to(myGameRoom).emit('messageReceived', { class: "server_msg", title: 'Tetris Madness Server says: ' + currentUser.username + ' left the game!' });
                socket.broadcast.to(myGameRoom).emit('playerExit', { message: currentUser.username + ' left the game!' });
            }
            socket.broadcast.emit('messageReceived', { class: "server_msg", title: 'Tetris Madness Server says: ', message: currentUser.username + ' has left chat.' });
        }
    });
});

server.listen(process.env.PORT || port, () => { 
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});