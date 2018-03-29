const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const shadowCanvas = document.getElementById('shadowTetris');
const shadowContext = shadowCanvas.getContext('2d');

const nextBlockCanvas = document.getElementById('nextBlockCanvas');
const nextBoxContext = nextBlockCanvas.getContext('2d');

context.scale(20, 20);
shadowContext.scale(20,20);
nextBoxContext.scale(30, 30);

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
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
    updateShadow();
    drawMatrix(player.matrix, player.pos, context);
}

function drawShadow() {
    shadowContent.fillStyle = '#000';
    shadowContent.fillRect(0, 0, shadowCanvas.width,shadowCanvas.height);
    drawMatrix(futurePieceBox, {x: 0, y:0}, shadowContent);
    drawMatrix(nextPiece.matrix, {x:0, y:0}, shadowContent);
}

function drawNext() {
    nextBoxContext.fillStyle = '#000';
    nextBoxContext.fillRect(0, 0, nextBlockCanvas.width,nextBlockCanvas.height);
    drawMatrix(futurePieceBox, {x: 0, y:0}, nextBoxContext);
    drawMatrix(nextPiece.matrix, {x:0, y:0}, nextBoxContext);
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
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
        updateShadow();
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.pos.x += offset;
    if (collide(arena, player)) {
        player.pos.x -= offset;
    }
    updateShadow();
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
    updateShadow();
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
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
    updateShadow();
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    lastTime = time;

    draw();
    requestAnimationFrame(update);
    updateShadow();
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
}


function drawShadow(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = '#4c4c4c';
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function shadowPosition(shadowArena, shadow) {
    const m = shadow.matrix;
    let depth = shadowArena.length - 1;
    while(depth > 0){
        shadow.pos.y = shadow.pos.y + 1;
        if (collide(arena, shadow)) {
            shadow.pos.y--;
            break;
        }    
        depth--;
    }
}

function shadowCollide(shadowArena, shadow) {
    const m = shadow.matrix;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (shadowArena[y + shadow.pos.y] &&
                shadowArena[y + shadow.pos.y][x + shadow.pos.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function updateShadow(){
    // console.log("PLAYER SHADOW FUNCTION INITIATED");
    shadow.matrix = player.matrix;
    shadow.pos.x = player.pos.x;
    shadowPosition(shadowArena, shadow);
    // drawMatrix(shadowArena, {x: 0, y: 0}, shadowContext);
    drawShadow(shadow.matrix, shadow.pos);
    // console.log("Shadow details: ",shadow);
}

function updateNext() {
    futurePieceBox.forEach(row => row.fill(0));
    // nextPiece.pos.y = (futurePieceBox.length / 2 | 0) -
    // (nextPiece.matrix.length / 2 | 0);
    // nextPiece.pos.x = (futurePieceBox[0].length / 2 | 0) -
    // (nextPiece.matrix[0].length / 2 | 0);
    merge(futurePieceBox, nextPiece);
    drawNext();
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 81) {
        playerRotate(-1);
    } else if (event.keyCode === 87) {
        playerRotate(1);
    }
});

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
    '#4c4c4c',
];

const arena = createMatrix(12, 20);
let shadowArena = createMatrix(12, 20);
const futurePieceBox = createMatrix(6,6);

let nextPiece = {
    pos: {x: 0, y: 0},
    matrix: randomPiece()
}

const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

const shadow = {
    pos: {x: player.pos.x, y: 0},
    matrix: player.matrix
}

playerReset();
updateScore();
update();
updateShadow();
updateNext();