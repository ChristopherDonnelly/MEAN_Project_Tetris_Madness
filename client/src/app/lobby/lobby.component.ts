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
    public playerService: PlayerService,
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
        this.playerService.gameId = gameData.gameId;
        this.playerService.opponent = gameData.username;
        this.playerService.opponentSocket = gameData.userSocket;
      });
  
    }
  }

  startGame(){
    this.playerService.socket.emit('createGame', { username: this.playerService.username });
  }
}