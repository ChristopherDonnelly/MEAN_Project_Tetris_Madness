import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpService {

  constructor(private _http: HttpClient){
    // this.getAllUsers();
  }
  
  login(data){
    return this._http.post('/login', data);
  }

  getPOD(){
    return this._http.get('/pod');
  }

  getAllUsers(){
    return this._http.get('/users');
  }

  getUser(id){
    return this._http.get('/users/'+id);
  }

  getUserGame(id, game_id){
    return this._http.get('/users/'+id+'/'+game_id);
  }

  updateUser(id, data){
    console.log('/users/'+id)
    console.log(data)
    return this._http.put('/users/'+id, data);
  }

  createUser(data){
    return this._http.post('/users', data);
  }

  deleteUser(id){
    return this._http.delete('/users/'+id);
  }

}
