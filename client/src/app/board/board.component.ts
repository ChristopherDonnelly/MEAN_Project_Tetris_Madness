import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { PlayerService } from '../player.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
  @ViewChild('tetris') private canvas: ElementRef;
  @ViewChild('opponentCanvas') private opponentCanvas: ElementRef;
  @ViewChild('nextBlockCanvas') private nextBlockCanvas: ElementRef;
  constructor(
    private playerService: PlayerService
  ) {
    this.addEventListener();
    
  }
  
  ngOnInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.opponentContext = this.opponentCanvas.nativeElement.getContext('2d');
    this.nextBoxContext = this.nextBlockCanvas.nativeElement.getContext('2d');

    this.context.scale(20, 20);
    this.opponentContext.scale(20, 20);
    this.nextBoxContext.scale(20, 20);
    
    this.gameRunning = true;
    this.playerReset();
    this.updateScore();  
    this.update();
  }
  
  ngAfterViewChecked(){
    try{
    }catch(err){}
  } 

  arena = this.createMatrix(12, 20);
  nextPiece = {
    pos: {x: 0, y: 0},
    matrix: this.randomPiece()
  }

  NextPieceBox = this.createMatrix(5,5);
  context;
  opponent = {
    pos: {x: 0, y:0},
    matrix: null,
    score: 0,
    lines: 0
}
  opponentArena = this.createMatrix(12, 20);
  opponentContext;
  nextBoxContext;

  
  dropCounter = 0;
  dropInterval = 1000;
  lastTime = 0;

  gameRunning = false;

  colors = [
      null,
      '#FF0D72',
      '#0DC2FF',
      '#0DFF72',
      '#F538FF',
      '#FF8E0D',
      '#FFE138',
      '#3877FF'
  ]

  player = {
      pos: {x: 0, y: 0}, // player has a position, which is the value of the offset
      matrix: null, 
      score: 0,
      lines: 0,
      singles: 0,
      doubles: 0,
      triples: 0,
      quadruples: 0
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
        else if (event.keyCode === 38 || event.keyCode === 81) { // UP or Q, rotate clockwise
            this.playerRotate(-1);
        }
        else if (event.keyCode === 87) { // W, rotate counter-clockwise
            this.playerRotate(1);
        }
    }); 
}

arenaSweep() {
    let rowCount = 0;
    let pointsMultiplier = 1;
    outer: for (let y = this.arena.length - 1; y > 0; --y) {
        for (let x = 0; x < this.arena[y].length; ++x) {
            if (this.arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = this.arena.splice(y, 1)[0].fill(0);
        this.arena.unshift(row);
        ++y;
        
        rowCount += 1;
        this.player.lines += 1;
        this.player.score += rowCount * 10 * pointsMultiplier;
        pointsMultiplier *= 2;
    }
    if (rowCount === 1) {
      this.player.singles += 1;
    }
    else if (rowCount == 2) {
      this.player.doubles += 1;
    }
    else if (rowCount == 3) {
      this.player.triples += 1;
    }
    else {
      this.player.quadruples += 1;
    }
}   
collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
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
    this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    this.drawMatrix(this.arena, {x: 0, y: 0}, this.context);
    this.drawMatrix(this.player.matrix, this.player.pos, this.context);
}
drawMatrix(matrix, offset, currentContext) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => { 
            if (value !== 0) {  // if value is not 0 => color
                currentContext.fillStyle = this.colors[value];
                currentContext.fillRect(x + offset.x, // context.fillRect(x, y, width, height)
                                y + offset.y, 
                                1, 1) 
            }
        });
    });
}
drawNext() {
  this.nextBoxContext.fillStyle = '#000';
  this.nextBoxContext.fillRect(0, 0, 100, 100); // hard coded
  this.drawMatrix(this.NextPieceBox, {x: 0, y: 0}, this.nextBoxContext);
  this.drawMatrix(this.nextPiece.matrix, this.nextPiece.pos, this.nextBoxContext);
}

drawOpponent() {
  this.opponentContext.fillStyle = '#000';
  this.opponentContext.fillRect(0, 0, 240, 400); // hard coded
  this.drawMatrix(this.opponentArena, {x: 0, y:0}, this.opponentContext);
  this.drawMatrix(this.opponent.matrix, this.opponent.pos, this.opponentContext);
} 

endOfGame() {
  this.player.score = 0;
  this.player.lines = 0;
}

updateOpponent() {
  this.opponent = this.player;
  this.opponentArena = this.arena;
  this.drawOpponent();
} 

merge(arena, player){
    this.player.matrix.forEach((row, y) => {
        row.forEach((value, x) => { // if it's a 0, we ignore it
            if (value !== 0) { // else we want to copy the value into the arena
                this.arena[y + this.player.pos.y][x + this.player.pos.x] = value;
            }
        });
    });
    this.updateOpponent();
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
    this.updateOpponent(); 
}
playerMove(offset) {
    this.player.pos.x += offset; // if we have moved L or R
    if (this.collide(this.arena, this.player)){ // and we collided in the arena
        this.player.pos.x -= offset; // then move back;
    }
    this.updateOpponent();
}
playerReset() {
    this.player.matrix = this.nextPiece.matrix;
    this.nextPiece.matrix = this.randomPiece();
    this.updateNext();
    this.player.pos.y = 0; // put player at the top
    this.player.pos.x = Math.floor(this.arena[0].length/2) - Math.floor(this.player.matrix[0].length/2);

    if (this.collide(this.arena, this.player)) { // if we collide when we reset the player
    this.endOfGame(); // then the game is over
    this.arena.forEach(row => row.fill(0)); // clear arena
    this.updateScore();
    }
    this.updateOpponent();
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
    this.updateOpponent();
}

randomPiece() {
  const pieces = 'TJLOSZI'; // list all available pieces in string
  return this.createPiece(pieces[Math.floor(pieces.length * Math.random())]);
}

rotate(matrix, direction) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
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
// update(time = 0) {
//     const deltaTime = time - this.lastTime;
    
//     this.dropCounter += deltaTime;
//     if (this.dropCounter > this.dropInterval) { // if the difference is greater than the interval, 
//       this.playerDrop();                   // drop the piece
//     }
//     this.lastTime = time;

//     this.draw();
//     requestAnimationFrame(this.update);
// }
update = (time = 0) => {
  const deltaTime = time - this.lastTime;

  this.dropCounter += deltaTime;

  if (this.dropCounter > this.dropInterval) {
    this.playerDrop();
  }

  this.playerService.my_data = this.dropCounter;

  this.lastTime = time;

  // this.playerService.socket.emit('update', {data: this.playerService.my_data, room_id: this.playerService.gameId, opponent_socket: this.playerService.opponentSocket});

  this.draw();
  // requestAnimationFrame(this.update);
  if(this.gameRunning) requestAnimationFrame(this.update.bind(this));
}
updateScore() {
  // document.getElementById('score').innerText = this.player.score.toString();
  // document.getElementById('lines').innerText = this.player.lines.toString();
}
updateNext() {
  this.NextPieceBox.forEach(row => row.fill(0));
  this.nextPiece.pos.y = (this.NextPieceBox.length / 2 | 0) - (this.nextPiece.matrix.length / 2 | 0);
    this.nextPiece.pos.x = (this.NextPieceBox[0].length / 2 | 0) - (this.nextPiece.matrix[0].length / 2 | 0);
    this.merge(this.NextPieceBox, this.nextPiece);
    this.drawNext();
}

}
