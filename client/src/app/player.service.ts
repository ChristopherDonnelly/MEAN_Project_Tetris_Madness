import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

@Injectable()
export class PlayerService {
  static instance: PlayerService;

  _id: String;
  username: String;
  
  socket;
  game_socket;

  opponent: String;
  gameId: String;
  opponentId: String;

  my_data: any;
  opponent_data: any;

  constructor() {
    return PlayerService.instance = PlayerService.instance || this;
  }

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

  // createGame(){
  //   this.socket.emit('createGame');
  // }

  joinGame(gameData){
    this.game_socket = io('http://localhost:8000/'+gameData.gameId);
    this.gameId = gameData.gameId;
    this.opponent = gameData.username;
    this.opponentId = gameData.userId;
  }

  updateGameData(playerData){
    if(playerData.won){
      this['wins'] += 1;
    }else{
      this['loses'] += 1;
    }
    this['score'] = playerData.score;
    this['single_clears'] = playerData.singles;
    this['double_clears'] = playerData.doubles;
    this['triple_clears'] = playerData.triples;
    this['tetris_clears'] = playerData.quadruples;

    this['games'].push({
        won: playerData.won,
        score: playerData.score,
        single_clear: playerData.singles,
        double_clear: playerData.doubles,
        triple_clear: playerData.triples,
        tetris_clear: playerData.quadruples,
        game_id: this.gameId,
        opponent_id: this.opponentId
    });
  }

}
