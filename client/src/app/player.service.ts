import { Injectable } from '@angular/core';

@Injectable()
export class PlayerService {
  _id: String;
  username: String;
  
  constructor() { }

  clear(){
    this._id = '';
    this.username = '';
  }
}
