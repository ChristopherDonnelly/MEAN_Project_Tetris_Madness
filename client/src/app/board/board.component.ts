import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {

  constructor() {
    this.canvas = document.getElementById('tetris');
      this.context = this.canvas.getContext('2d');
      this.addEventListener();

      //test
      this.playerReset();
      this.updateScore();  
      this.update();
   }

  ngOnInit() {
  }
  arena = this.createMatrix(12, 20);
  canvas;
  context;
  
  dropCounter = 0;
  dropInterval = 1000;
  lastTime = 0;
  
  colors = [
      null,
      'red',
      'orange',
      'pink',
      'green',
      'blue',
      'purple'
  ]

  player = {
      pos: {x: 0, y: 0}, // player has a position, which is the value of the offset
      matrix: this.createPiece('T'), 
      score: 0
  }
  addEventListener(){
    document.addEventListener('keydown', event => { 
        // move player
        if (event.keyCode === 37) { // LEFT
            this.playerMove(-1);
        } 
        else if (event.keyCode === 39 ) { // RIGHT
           this.playerMove(1);
        }
        else if (event.keyCode === 40) { // DOWN
            this.playerDrop();
        }
        else if (event.keyCode === 81) { // Q, rotate clockwise
            this.playerRotate(-1);
        }
        else if (event.keyCode === 87) { // W, rotate counter-clockwise
            this.playerRotate(1);
        }
    }); 
}

arenaSweep() {
    let rowCount = 1;
    outer: for (let y = this.arena.length - 1; y > 0; --y) {
        for (let x = 0; x < this.arena[y].length; ++x) {
            if (this.arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = this.arena.splice(y, 1)[0].fill(0);
        this.arena.unshift(row);
        ++y;

        this.player.score += rowCount * 10;
        rowCount *= 2;
    }
}   
collide(arena, player) {
    const [m, o] = [player.matrix, player.pos]; // matrix, player's position
    
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 && // when BOTH player &
                (arena[y + o.y] && 
                arena[y + o.y][x + o.x]) !== 0) {  // arena are not 0, they collide
                return true;
            }
        }
    }
    return false; // if no collision was detected, return false
}
createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
createPiece(type) {
    if (type === 'T') {
        return [ 
            [0, 0, 0], 
            [1, 1, 1], 
            [0, 1, 0]
        ];
    }
    else if (type === 'O') { // box piece. 
        return [             // doesn't really rotate
            [2, 2], 
            [2, 2],         
        ];
    }
    else if (type === 'L') {
        return [ 
            [0, 3, 0], 
            [0, 3, 0], 
            [0, 3, 3]
        ];
    }
    else if (type === 'J') { // backwards L piece
        return [ 
            [0, 4, 0], 
            [0, 4, 0], 
            [4, 4, 0]
        ];
    }
    else if (type === 'I') { // long bar piece
        return [ 
            [0, 5, 0, 0], 
            [0, 5, 0, 0], 
            [0, 5, 0, 0],
            [0, 5, 0, 0]
        ];
    }
    else if (type === 'S') {
        return [ 
            [0, 6, 6], 
            [6, 6, 0], 
            [0, 0, 0]
        ];
    }
    else if (type === 'Z') { 
        return [ 
            [7, 7, 0], 
            [0, 7, 7], 
            [0, 0, 0]
        ];
    }
}
draw() {
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawMatrix(this.arena, {x: 0, y: 0});
    this.drawMatrix(this.player.matrix, this.player.pos);
}
drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => { 
            if (value != 0) {  // if value is not 0 => color
                this.context.fillStyle = this.colors[value];
                this.context.fillRect(x + offset.x, // context.fillRect(x, y, width, height)
                                y + offset.y, 
                                1, 1) 
            }
        });
    });
}
// the above will copy our pieces (so non-0's in piece matrices) to the arena
merge(arena, player){
    this.player.matrix.forEach((row, y) => {
        row.forEach((value, x) => { // if it's a 0, we ignore it
            if (value !== 0) { // else we want to copy the value into the arena
                this.arena[y + this.player.pos.y][x + this.player.pos.x] = value;
            }
        });
    });
}
playerDrop() {
    this.player.pos.y++;
    // if we drop & we collide, that means we are touching ground or another piece
    if (this.collide(this.arena, this.player)){ 
        this.player.pos.y--; 
        this.merge(this.arena, this.player);
        this.playerReset(); // if we do collide, we need to move the player back up
        this.arenaSweep();
        this.updateScore();
    }
    this.dropCounter = 0; // reset dropCounter, b/c we don't want another drop to happen immediately after, we want a 1-sec delay 
}
playerMove(direction) {
    this.player.pos.x += direction; // if we have moved L or R
    if (this.collide(this.arena, this.player)){ // and we collided in the arena
        this.player.pos.x -= direction; // then move back;
    }
}
playerReset() {
    const pieces = 'ILJOTSZ'; // list all available pieces in string
    this.player.matrix = this.createPiece(pieces[pieces.length * Math.random() | 0]); // select rand letter = random piece
    this.player.pos.y = 0; // put player at the top
    this.player.pos.x = (this.arena[0].length/2 | 0) - (this.player.matrix[0].length/2 | 0);

    if (this.collide(this.arena, this.player)) { // if we collide when we reset the player, then the game is over
    this.arena.forEach(row => row.fill(0)); // clear arena
    this.player.score = 0;
    this.updateScore();
    }
}
playerRotate(direction) {
    const pos = this.player.pos.x; // save the position
    let offset = 1;
    this.rotate(this.player.matrix, direction);

    // also check for collision, so we don't rotate into a wall
    while (this.collide(this.arena, this.player)) {
        this.player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > this.player.matrix[0].length) { 
            this.rotate(this.player.matrix, -direction);
            this.player.pos.x = pos;
            return;
        }
    }
}

rotate(matrix, direction) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            [
                matrix[x][y],  // [a, b] = [b, a] is the same thing as setting a var tempt to swap vals of a & b
                matrix[y][x]
            ] = [   // tuple switch to rotate
                matrix[y][x],
                matrix[x][y]
            ]
        }
    }
    // now we want to check the direction
    if (direction > 0) { // if the direction is positive
        matrix.forEach(row => row.reverse()); // reverse the x values inside row
    }
    else {
        matrix.reverse(); // else we just reverse the matrix, or the y values (entire rows inside the matrix)
    }
}
update(time = 0) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) { // if the difference is greater than the interval, 
        this.playerDrop();                   // drop the piece
    }

    this.draw();
    requestAnimationFrame(this.update);
}
updateScore() {
    document.getElementById('score').innerText = this.player.score.toString();
}
}
