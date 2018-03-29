import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { PlayerService } from '../player.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

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
      this.playerService.socket.on('messageReceived', (data) => {
        console.log('data: '+data)
      });

      this.playerService.socket.on('gameInfo', (gameData) => {
        console.log('Game Id: '+gameData);
        this.playerService.joinGame(gameData);
      });

      this.playerService.socket.on('joinGame', (gameData) => {
        console.log('Joining Game')
        this.playerService.gameId = gameData.gameId;
        this.playerService.opponent = gameData.username;
        this.playerService.opponentSocket = gameData.userSocket;
      });

      this.playerService.socket.on('startGame', (gameData) => {
        this.gameRunning = true;
        this.update();
      });
  
      this.playerService.socket.on('updateOpponent', (gameData) => {
        console.log('Update Opponent Time: '+gameData.data)
        this.playerService.opponent_data = gameData.data;
      });
  
      this.playerService.socket.on('playerExit', (gameData) => {
        console.log(gameData.message)
        this.gameRunning = false;
      });
  
    }
  }

  dropCounter = 0;
  dropInterval = 1000;

  lastTime = 0;
  gameRunning = false;

  update = (time = 0) => {
    const deltaTime = time - this.lastTime;

    this.dropCounter += deltaTime;

    if (this.dropCounter > this.dropInterval) {
      this.dropCounter = 0;
    }

    this.playerService.my_data = this.dropCounter;

    this.lastTime = time;

    this.playerService.socket.emit('update', {data: this.playerService.my_data, room_id: this.playerService.gameId, opponent_socket: this.playerService.opponentSocket});

    //requestAnimationFrame(this.update);
    if(this.gameRunning) requestAnimationFrame(this.update.bind(this));
  }

  startGame(){
    this.playerService.socket.emit('createGame', { username: this.playerService.username });
  }
}
