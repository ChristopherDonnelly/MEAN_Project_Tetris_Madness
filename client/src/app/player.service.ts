import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

@Injectable()
export class PlayerService {
  _id: String;
  username: String;
  
  socket;
  game_socket;

  opponent: String;
  gameId: String;
  opponentSocket: String;

  my_data: Number;
  opponent_data: Number;

  constructor() { }

  clear(){
    this._id = '';
    this.username = '';

    this.my_data = 1;
    this.opponent_data = 1;
  }

  connect(){
    this.socket = io('http://localhost:8000');
    this.socket.emit('introMessage', { username: this.username, message: ' has entered chat!'});
  }

  createGame(){
    this.socket.emit('createGame');
  }

  joinGame(gameData){
    this.game_socket = io('http://localhost:8000/'+gameData.gameId);
    this.gameId = gameData.gameId;
    this.opponent = gameData.username;
    this.opponentSocket = gameData.userSocket;
  }

}
