import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpService {

  constructor(private _http: HttpClient){
    this.getAllUsers();
  }
  
  getAllUsers(){
    return this._http.get('/users');
  }

  getUser(id){
    return this._http.get('/users/'+id);
  }

  updateUser(id, data){
    return this._http.put('/users/'+id, data);
  }

  createUser(data){
    return this._http.post('/users', data);
  }

  deleteUser(id){
    return this._http.delete('/users/'+id);
  }

}
