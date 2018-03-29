const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const opponentCanvas = document.getElementById('opponentCanvas');
const opponentContext = opponentCanvas.getContext('2d');

const nextBlockCanvas = document.getElementById('nextBlockCanvas');
const nextBoxContext = nextBlockCanvas.getContext('2d');

context.scale(20, 20);
opponentContext.scale(20, 20);
nextBoxContext.scale(20, 20);

function arenaSweep() {
    let rowCount = 0;
    let pointsMultiplier = 1;
    console.log(player.sabotage);
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0 || arena[y][x] === 8) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        rowCount += 1;
        player.lines += 1;
        player.score += rowCount * 10 * pointsMultiplier;
        pointsMultiplier *= 2;
    }
    if (rowCount == 1) {player.singles += 1;}
    else if (rowCount == 2) {player.doubles += 1;}
    else if (rowCount == 3) {player.triples += 1;}
    else {player.quadruples += 1;}
    levelUp();
}

function levelUp() {
    if (player.lines == 2) {player.level = 2;}
    if (player.lines == 5) {player.level = 3;}
    if (player.lines == 8) {player.level = 4;}
    if (player.lines == 12) {player.level = 5;}
    if (player.lines == 16) {player.level = 6;}
    if (player.lines == 21) {player.level = 7;}
    if (player.lines == 27) {player.level = 8;}
    if (player.lines == 33) {player.level = 9;}
    if (player.lines == 40) {player.level = 10;}
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type)
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset, currentContext) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                currentContext.fillStyle = colors[value];
                currentContext.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0}, context);
    drawMatrix(player.matrix, player.pos, context);
}

function drawNext() {
    nextBoxContext.fillStyle = '#000';
    nextBoxContext.fillRect(0, 0, nextBlockCanvas.width,nextBlockCanvas.height);
    drawMatrix(NextPieceBox, {x: 0, y:0}, nextBoxContext);
    drawMatrix(nextPiece.matrix, nextPiece.pos, nextBoxContext);
}

function drawOpponent() {
    opponentContext.fillStyle = '#000';
    opponentContext.fillRect(0, 0, opponentCanvas.width,opponentCanvas.height);
    drawMatrix(opponentArena, {x: 0, y:0}, opponentContext);
    drawMatrix(opponent.matrix, opponent.pos, opponentContext);
}

function updateOpponent() {
    opponent = player;
    opponentArena = arena;
    drawOpponent();
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });    
    addConcrete(arena);
    updateOpponent();
}

function addConcrete(arena){
    let concrete = 0;
    for (let y = arena.length - 1; y >=0; y--) {
        if (arena[y][0] === 8){concrete += 1}
    };
    for (let i=0; i < (player.sabotage - concrete); i++) {
        arena.push([8,8,8,8,8,8,8,8,8,8,8,8]);  
        arena.shift();
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep(); 
        updateScore();
    }
    dropCounter = 0;
    updateOpponent();
}

function hardDrop() {
    let movement = arena.length-1;
    while(movement > 0) {
        player.pos.y++;
        if (collide(arena, player)) {
            player.pos.y--;
            merge(arena, player);
            playerReset();
            arenaSweep(); 
            updateScore();
            dropCounter = 0;
            updateOpponent();
            break;
        }
        movement--;
    }    
}   

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
    updateOpponent();
}

function randomPiece(){
    const pieces = 'TJLOSZI';
    return createPiece(pieces[pieces.length * Math.random() | 0]);
}

function playerReset() {
    player.matrix = nextPiece.matrix;
    nextPiece.matrix = randomPiece();
    updateNext();
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        endOfGame();
        arena.forEach(row => row.fill(0));
        updateScore();
    }
    updateOpponent();
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
    updateOpponent();
}

let dropCounter = 0;
let dropInterval = 1000;


let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropInterval = 1000 / (player.level);

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
    document.getElementById('lines').innerText = player.lines;
    document.getElementById('level').innerText = player.level;
}

function updateNext() {
    NextPieceBox.forEach(row => row.fill(0));
    nextPiece.pos.y = (NextPieceBox.length / 2 | 0) - (nextPiece.matrix.length / 2 | 0);
    nextPiece.pos.x = (NextPieceBox[0].length / 2 | 0) - (nextPiece.matrix[0].length / 2 | 0);
    nextPiece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                NextPieceBox[y + nextPiece.pos.y][x + nextPiece.pos.x] = value;
            }
        });
    }); 
    drawNext();
}

function endOfGame() {
    // ADD: current player stats sent to database
    // ADD: send "end of game" to socket
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81 || event.keyCode === 38) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    } else if (event.keyCode == 32) {
        hardDrop();
    }
});

function initializePlayer() {
    return {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
    result: "win",
    level: 1,
    lines: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    quadruples: 0,
    sabotage: 0
    }
}

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
    '#6b6767',
    '#7ab1a9',
];

let player = initializePlayer();

const arena = createMatrix(12, 20);
let opponentArena = createMatrix(12, 20);
const NextPieceBox = createMatrix(5,5);

let nextPiece = {
    pos: {x: 0, y: 0},
    matrix: randomPiece()
}

let opponent = {
    pos: {x: 0, y:0},
    matrix: null,
    score: 0,
    lines: 0
}

initializePlayer();
playerReset();
updateScore();
update();
