const xp = require("express");
const bp = require("body-parser");
const port = 8000;

const app = xp();

app.use(bp.json());
app.use(xp.static(__dirname + '/client/dist'));

require('./server/config/mongoose.js');
require('./server/config/routes.js')(app);

let users = [];
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
        var newGame;

        console.log('Message: '+player.username);
        console.log(gameQueue)

        if(gameQueue.gameId==''){
            let val = (socket.id.length/4);
            let gameId = socket.id.substring(val, socket.id.length-val);
            
            gameQueue.gameId = gameId;
            gameQueue.username = player.username;
            gameQueue.userSocket = socket.id;
    
            console.log('gameInfo.gameId: '+gameQueue.gameId)
            console.log('gameInfo.username: '+gameQueue.username)
            console.log('gameInfo.userSocket: '+gameQueue.userSocket)

            socket.emit('gameInfo', gameQueue);

            newGame = io.of('/'+gameId);

            newGame.on('connection', function(socket){
                console.log('someone connected');
                newGame.emit('joinGame', 'You joined the game!');
            });
        }else{
            socket.emit('gameInfo', gameQueue);
            newGame.broadcast.emit('gameInfo', gameQueue);
            gameQueue = {
                gameId: '',
                username: '',
                userSocket: ''
            };
        }

    });

    socket.on('disconnect', function () {
        let currentUser = users.filter( obj => obj.id == socket.id )[0];
        users = users.filter( obj => obj.id != socket.id );
        if(currentUser){
            socket.broadcast.emit('messageReceived', { class: "server_msg", title: 'Tetris Madness Server says: ', message: currentUser.username + ' has left chat.' });
        }
    });
});