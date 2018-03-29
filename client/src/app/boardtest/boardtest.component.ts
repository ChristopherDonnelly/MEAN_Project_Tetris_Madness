import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { HttpService } from '../http.service';
import { PlayerService } from '../player.service';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-boardtest',
  templateUrl: './boardtest.component.html',
  styleUrls: ['./boardtest.component.css'],

  animations: [
    trigger('myAwesomeAnimation', [
      state('small', style({
        transform: 'scale(1)',
      })),
      state('large', style({
        transform: 'scale(1.2)',
      })),

      transition('small <=> large', animate('1000ms ease-in', keyframes([
          style({opacity: 0, transform: 'translateY(-75%)', offset: 0}),
          style({opacity: 1, transform: 'translateY(35%)', offset: .5}),
          style({opacity: 0, transform: 'translateY(0)', offset: 1 }),
      ]))),
    ]),
  ]
})
export class BoardtestComponent implements OnInit {

    state: string = 'small'

  @ViewChild('tetris') private canvas: ElementRef;
  @ViewChild('opponentCanvas') private opponentCanvas: ElementRef;
  @ViewChild('nextBlockCanvas') private nextBlockCanvas: ElementRef;

  constructor(
    private playerService: PlayerService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _httpService: HttpService
  ) { }

  ngOnInit() {
    if(!this.playerService.username){
        this._router.navigate(['/']);
    }else{
        this.addEventListener();
        this.context = this.canvas.nativeElement.getContext('2d');
        this.opponentContext = this.opponentCanvas.nativeElement.getContext('2d');
        this.nextBoxContext = this.nextBlockCanvas.nativeElement.getContext('2d');

        this.context.scale(20, 20);
        this.opponentContext.scale(20, 20);
        this.nextBoxContext.scale(20, 20);

        this.playerService.socket.on('updateOpponent', (gameData) => {
            console.log('Update Opponent Time: '+gameData.data)
            this.opponent = gameData.data.player;
            this.opponentArena = gameData.data.arena;
            this.drawOpponent();
        });

        this.gameRunning = true;
        this.playerReset();
        this.updateScore();
        this.update();
    }
  }

  ngAfterViewChecked() {
    try {
    }catch(err) {}
  }

    arena = this.createMatrix(12, 20);

    colors = [
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

    context;

    gameRunning = false;

    nextBoxContext;

    nextPiece = {
    pos: {x: 0, y: 0},
    matrix: this.randomPiece()
    }

    NextPieceBox = this.createMatrix(5,5);

    opponentArena = this.createMatrix(12, 20);

    opponentContext;

    dropCounter = 0;
    dropInterval = 1000;
    lastTime = 0;

    player = {
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

    opponent = {
        pos: {x: 0, y:0},
        matrix: null,
        score: 0,
        lines: 0
    }

  animateMe() {
      this.state = (this.state === 'small' ? 'large' : 'small');
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
        else if (event.keyCode == 32) { // SPACEBAR
            this.hardDrop();
        }
    }); 
  }

  arenaSweep() {
    let rowCount = 0;
    let pointsMultiplier = 1;
    outer: for (let y = this.arena.length -1; y > 0; --y) {
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
    if (rowCount == 1) {
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
    this.levelUp();
  }

  collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && // when BOTH player &
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) { // arena are not 0, they collide
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
  
  
  draw() {
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    this.playerService.my_data = {arena: this.arena, player: this.player};
    this.playerService.socket.emit('update', {data: this.playerService.my_data, room_id: this.playerService.gameId, opponent_socket: this.playerService.opponentSocket});

    this.drawMatrix(this.arena, {x: 0, y: 0}, this.context);
    this.drawMatrix(this.player.matrix, this.player.pos, this.context);
  }
  
  drawMatrix(matrix, offset, currentContext) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                currentContext.fillStyle = this.colors[value];
                currentContext.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
  }

  drawNext() {
    this.nextBoxContext.fillStyle = '#000';
    this.nextBoxContext.fillRect(0, 0, this.nextBlockCanvas.nativeElement.width,this.nextBlockCanvas.nativeElement.height);
    this.drawMatrix(this.NextPieceBox, {x: 0, y:0}, this.nextBoxContext);
    this.drawMatrix(this.nextPiece.matrix, this.nextPiece.pos, this.nextBoxContext);
  }

  drawOpponent() {
    this.opponentContext.fillStyle = '#000';
    this.opponentContext.fillRect(0, 0, this.opponentCanvas.nativeElement.width,this.opponentCanvas.nativeElement.height);
    this.drawMatrix(this.opponentArena, {x: 0, y:0}, this.opponentContext);
    this.drawMatrix(this.opponent.matrix, this.opponent.pos, this.opponentContext);
  }

  endOfGame() {
    this.player.score = 0;
    this.player.lines = 0;
  }

  hardDrop() {
    let movement = this.arena.length-1;
    while(movement > 0) {
        this.player.pos.y++;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.y--;
            this.merge(this.arena, this.player);
            this.playerReset();
            this.arenaSweep(); 
            this.updateScore();
            this.dropCounter = 0;
            break;
        }
        movement--;
    }
  }

  levelUp() {
    if (this.player.lines == 2) {this.player.level = 2;}
    if (this.player.lines == 5) {this.player.level = 3;}
    if (this.player.lines == 8) {this.player.level = 4;}
    if (this.player.lines == 12) {this.player.level = 5;}
    if (this.player.lines == 16) {this.player.level = 6;}
    if (this.player.lines == 21) {this.player.level = 7;}
    if (this.player.lines == 27) {this.player.level = 8;}
    if (this.player.lines == 33) {this.player.level = 9;}
    if (this.player.lines == 40) {this.player.level = 10;}
  }

  merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
    // this.updateOpponent();
  }

  playerDrop() {
    this.player.pos.y++;
    if (this.collide(this.arena, this.player)) {
        this.player.pos.y--;
        this.merge(this.arena, this.player);
        this.playerReset();
        this.arenaSweep(); 
        this.updateScore();
    }
    this.dropCounter = 0; 
    // this.updateOpponent();
  }

  playerMove(offset) {
    this.player.pos.x += offset;
    if (this.collide(this.arena, this.player)) {
        this.player.pos.x -= offset;
    }
    // this.updateOpponent();
  }

  playerReset() {
    this.player.matrix = this.nextPiece.matrix;
    this.nextPiece.matrix = this.randomPiece();
    this.updateNext();
    this.player.pos.y = 0;
    this.player.pos.x = (this.arena[0].length / 2 | 0) -
                   (this.player.matrix[0].length / 2 | 0);
    if (this.collide(this.arena, this.player)) {
        this.endOfGame();
        this.arena.forEach(row => row.fill(0));
        this.updateScore();
    }
    // this.updateOpponent();
  }

  playerRotate(dir) {
    const pos = this.player.pos.x;
    let offset = 1;
    this.rotate(this.player.matrix, dir);
    while (this.collide(this.arena, this.player)) {
      this.player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > this.player.matrix[0].length) {
          this.rotate(this.player.matrix, -dir);
          this.player.pos.x = pos;
            return;
        }
    }
    // this.updateOpponent();
  }

  randomPiece(){
    const pieces = 'TJLOSZI';
    return this.createPiece(pieces[pieces.length * Math.random() | 0]);
  }

  rotate(matrix, dir) {
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

  update = (time = 0) => {
    const deltaTime = time - this.lastTime;
    
    this.dropInterval = 1000 / (this.player.level);

    this.dropCounter += deltaTime;
  
    if (this.dropCounter > this.dropInterval) {
      this.playerDrop();
    }
  
    this.lastTime = time;
  
    this.draw();
    // requestAnimationFrame(this.update); 
    if(this.gameRunning) requestAnimationFrame(this.update.bind(this));
    }

//   updateOpponent() {
//     this.opponent = this.player;
//     this.opponentArena = this.arena;
//     this.drawOpponent();
//     }

  updateScore() {
    // document.getElementById('score').innerText = this.player.score;
    // document.getElementById('lines').innerText = this.player.lines;
    // document.getElementById('level').innerText = this.player.level;
    // we used angular's variable injection to display score/lines cleared {{ }}
  }

  updateNext() {
    this.NextPieceBox.forEach(row => row.fill(0));
    this.nextPiece.pos.y = (this.NextPieceBox.length / 2 | 0) - (this.nextPiece.matrix.length / 2 | 0);
    this.nextPiece.pos.x = (this.NextPieceBox[0].length / 2 | 0) - (this.nextPiece.matrix[0].length / 2 | 0);
    this.merge(this.NextPieceBox, this.nextPiece);
    this.drawNext();
  }

}
