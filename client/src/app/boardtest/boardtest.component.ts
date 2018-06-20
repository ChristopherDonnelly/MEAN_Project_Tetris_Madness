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
                style({ opacity: 0, transform: 'translateY(-75%)', offset: 0 }),
                style({ opacity: 1, transform: 'translateY(35%)', offset: .5 }),
                style({ opacity: 0, transform: 'translateY(0)', offset: 1 }),
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

    requestId = undefined;

    ngOnInit() {
        if (!this.playerService.username) {
            this._router.navigate(['/']);
        } else {
            this.context = this.canvas.nativeElement.getContext('2d');
            this.opponentContext = this.opponentCanvas.nativeElement.getContext('2d');
            this.nextBoxContext = this.nextBlockCanvas.nativeElement.getContext('2d');

            this.context.scale(20, 20);
            this.opponentContext.scale(20, 20);
            this.nextBoxContext.scale(20, 20);

            this.playerService.socket.on('updateOpponent', (gameData) => {
                // console.log('Update Opponent Time: '+gameData.data)
                this.opponent = gameData.data.player;
                this.opponentArena = gameData.data.arena;

                this.drawPiece(this.opponentContext, this.opponentCanvas, this.opponentArena, this.opponent);
            });

            this.playerService.socket.on('playerExit', (gameData) => {
                this.opponentLost();
            });

            this.playerService.socket.on('opponentLost', (gameData) => {
                this.opponentLost();
            });

            this.playerService.socket.on('addSabotage', (gameData) => {
                this.player.sabotage += gameData.sabotage;
            });

            this.arena.forEach(row => row.fill(0));

            this.gameRunning = true;
            this.playerReset();

            this.requestId = requestAnimationFrame(this.updateTime);

            this.eventList = this.eventList.bind(this);

            document.addEventListener('keydown', this.eventList);
        }
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
        '#4c4c4c'
    ];

    context;

    gameRunning = false;

    nextBoxContext;

    nextPiece = {
        pos: { x: 0, y: 0 },
        matrix: this.randomPiece()
    }

    nextPieceBox = this.createMatrix(5, 5);

    opponentArena = this.createMatrix(12, 20);

    opponentContext;

    dropCounter = 0;
    dropInterval = 1000;
    lastTime = 0;

    player = {
        pos: { x: 0, y: 0 },
        matrix: null,
        score: 0,
        result: "win",
        level: 1,
        lines: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        quadruples: 0,
        sabotage: 0,
        won: false
    }

    opponent = {
        pos: { x: 0, y: 0 },
        matrix: null,
        score: 0,
        result: "win",
        level: 1,
        lines: 0,
        singles: 0,
        doubles: 0,
        triples: 0,
        quadruples: 0,
        sabotage: 0,
        won: false
    }

    addConcrete() {
        let concrete = 0;
        for (let y = this.arena.length - 1; y >= 0; y--) {
            if (this.arena[y][0] == 8) {
                concrete = concrete + 1;
            }
        };
        for (let i = 0; i < (this.player.sabotage - concrete); i++) {
            let rand_blocks = [8];
            // coin flipt to determine space vs. concrete block to randomize sabotage sent
            for (let i = 0; i < 11; i++) {
                let randomize = Math.round(Math.random());
                if (randomize == 1) {
                    rand_blocks.push(8); // concrete
                }
                else {
                    rand_blocks.push(0); // space
                }
            }
            this.arena.shift();
            this.arena.push(rand_blocks);
        }
    }

    eventList(event){
        if (event.keyCode === 37) { // LEFT
            this.playerMove(-1);
        }
        else if (event.keyCode === 39) { // RIGHT
            this.playerMove(1);
        }
        else if (event.keyCode === 40) { // DOWN
            // prevent scrolling
            event.preventDefault();
            this.playerDrop();
        }
        else if (event.keyCode === 38 || event.keyCode === 81) { // UP or Q, rotate clockwise
            event.preventDefault();
            this.playerRotate(-1);
        }
        else if (event.keyCode === 87) { // W, rotate counter-clockwise
            this.playerRotate(1);
        }
        else if (event.keyCode == 32) { // SPACEBAR
            event.preventDefault();
            this.hardDrop();
        }
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
        if (rowCount == 1) {
            this.player.singles += 1;
        }
        else if (rowCount == 2) {
            this.player.doubles += 1;
            this.playerService.socket.emit('sabotage', { sabotage: 1 });
        }
        else if (rowCount == 3) {
            this.player.triples += 1;
            this.playerService.socket.emit('sabotage', { sabotage: 2 });
        }
        else if (rowCount == 4) {
            this.player.quadruples += 1;
            this.playerService.socket.emit('sabotage', { sabotage: 4 });
        }
        this.levelUp();
    }

    collide() {
        const _matrix = this.player.matrix;
        const _pos = this.player.pos;
        for (let y = 0; y < _matrix.length; ++y) {
            for (let x = 0; x < _matrix[y].length; ++x) {
                // when BOTH player & arena are not 0, they collide
                if (_matrix[y][x] !== 0 && (this.arena[y + _pos.y] && this.arena[y + _pos.y][x + _pos.x]) !== 0) {
                    console.log(this.arena);
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
                [0, 1, 0, 0]
            ];
        } else if (type === 'L') {
            return [
                [0, 2, 0],
                [0, 2, 0],
                [0, 2, 2]
            ];
        } else if (type === 'J') {
            return [
                [0, 3, 0],
                [0, 3, 0],
                [3, 3, 0]
            ];
        } else if (type === 'O') {
            return [
                [4, 4],
                [4, 4]
            ];
        } else if (type === 'Z') {
            return [
                [5, 5, 0],
                [0, 5, 5],
                [0, 0, 0]
            ];
        } else if (type === 'S') {
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ];
        } else if (type === 'T') {
            return [
                [0, 7, 0],
                [7, 7, 7],
                [0, 0, 0]
            ];
        }
    }

    draw() {
        this.drawPiece(this.context, this.canvas, this.arena, this.player);

        this.playerService.my_data = { arena: this.arena, player: this.player };
        this.playerService.socket.emit('update', { data: this.playerService.my_data, room_id: this.playerService.gameId, opponentId: this.playerService.opponentId });
    }

    drawMatrix(matrix, offset, currentContext) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    currentContext.fillStyle = this.colors[value];
                    currentContext.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    drawPiece(_context, _canvas, _area, _obj) {
        _context.fillStyle = '#000';
        _context.fillRect(0, 0, _canvas.nativeElement.width, _canvas.nativeElement.height);
        this.drawMatrix(_area, { x: 0, y: 0 }, _context);
        this.drawMatrix(_obj.matrix, _obj.pos, _context);
    }

    endOfGame() {
        console.log('You Lost!');

        this.player.won = false;
        this.playerService.socket.emit('endGame');
        this.savePlayerInfo();
    }

    opponentLost() {
        console.log('Opponent Lost!');

        this.player.won = true;
        this.savePlayerInfo();
    }

    savePlayerInfo() {
        console.log("Save Player Info!");

        cancelAnimationFrame(this.requestId);
        this.requestId = undefined;

        document.removeEventListener('keydown', this.eventList);

        let updatePlayer = this._httpService.updateUser(this.playerService._id, this.playerService.updateGameData(this.player));

        updatePlayer.subscribe(data => {
            if (data['message'] == 'ERROR') {
                console.log('Got this Error!');
                console.log(data['error']);
            } else {
                // console.log('reroute to stats page, send current game #');
                this._router.navigate(['/stats', this.playerService['games'].length-1]);
            }
        });
    }

    hardDrop() {
        console.log("HARD DROP")
        let movement = this.arena.length - 1;
        while (movement > 0 && this.playerDrop()) movement--;
    }

    playerDrop() {
        let dropped = true;
        this.player.pos.y++;
        if (this.collide()) {
            this.player.pos.y--;
            this.merge();
            this.playerReset();
            this.arenaSweep();
            dropped = false;
        }
        this.dropCounter = 0;
        return dropped;
    }

    levelUp() {
        if (this.player.lines == 2) { this.player.level = 2; }
        if (this.player.lines == 5) { this.player.level = 3; }
        if (this.player.lines == 8) { this.player.level = 4; }
        if (this.player.lines == 12) { this.player.level = 5; }
        if (this.player.lines == 16) { this.player.level = 6; }
        if (this.player.lines == 21) { this.player.level = 7; }
        if (this.player.lines == 27) { this.player.level = 8; }
        if (this.player.lines == 33) { this.player.level = 9; }
        if (this.player.lines == 40) { this.player.level = 10; }
    }

    merge() {
        this.player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.arena[y + this.player.pos.y][x + this.player.pos.x] = value;
                }
            });
        });
        this.addConcrete();
    }

    playerMove(offset) {
        this.player.pos.x += offset;
        if (this.collide()) {
            this.player.pos.x -= offset;
        }
    }

    playerReset() {
        this.player.matrix = this.nextPiece.matrix;
        this.nextPiece.matrix = this.randomPiece();
        this.updateNext();
        this.player.pos.y = 0;
        this.player.pos.x = (this.arena[0].length / 2 | 0) - (this.player.matrix[0].length / 2 | 0);
        this.draw();
        if (this.collide()) this.endOfGame();
    }

    playerRotate(dir) {
        const pos = this.player.pos.x;
        let offset = 1;
        this.rotate(this.player.matrix, dir);
        while (this.collide()) {
            this.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.player.matrix[0].length) {
                this.rotate(this.player.matrix, -dir);
                this.player.pos.x = pos;
                return;
            }
        }
    }

    randomPiece() {
        const pieces = 'TJLOSZI';
        return this.createPiece(pieces[pieces.length * Math.random() | 0]);
    }

    rotate(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [
                    matrix[x][y],
                    matrix[y][x]
                ] = [
                    matrix[y][x],
                    matrix[x][y]
                ];
            }
        }

        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    updateTime = (time = 0) => {

        if (!this.requestId) this.gameRunning = false;

        if (this.gameRunning) {

            const deltaTime = time - this.lastTime;
            this.dropInterval = 1000 / (this.player.level);
            this.dropCounter += deltaTime;

            if (this.dropCounter > this.dropInterval) {
                this.playerDrop();
            }

            this.lastTime = time;

            this.draw();
            requestAnimationFrame(this.updateTime);

        }
    }

    updateNext() {
        this.nextPieceBox.forEach(row => row.fill(0));
        this.nextPiece.pos.y = (this.nextPieceBox.length / 2 | 0) - (this.nextPiece.matrix.length / 2 | 0);
        this.nextPiece.pos.x = (this.nextPieceBox[0].length / 2 | 0) - (this.nextPiece.matrix[0].length / 2 | 0);
        this.nextPiece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.nextPieceBox[y + this.nextPiece.pos.y][x + this.nextPiece.pos.x] = value;
                }
            });
        });

        this.drawPiece(this.nextBoxContext, this.nextBlockCanvas, this.nextPieceBox, this.nextPiece);
    }

}
