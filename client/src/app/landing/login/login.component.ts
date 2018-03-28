import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpService } from '../../http.service';
import { PlayerService } from '../../player.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {
  username: any;
  error: boolean;

  constructor(
    public playerService: PlayerService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _httpService: HttpService
  ) { }

  ngOnInit() {

    this.username = {errors: ''}
    this.error = false;

    this.playerService.clear();
  }

  login(){

    let loginPlayer = this._httpService.login({username: this.playerService.username});
    loginPlayer.subscribe(data => {
      if(data['message'] == 'Error'){
        this.error = true;
        if(data['error'].indexOf('E11000')!=-1){
          this.username.errors = "Username already exists"
        }else{
          console.log(data['error'].errors.username.message)
          this.username.errors = data['error'].errors.username.message;
        }
      }else{
        console.log('Player Logged in as Username: '+data['user'].username);
        this.playerService.username = data['user'].username;
        this.playerService.connect();

        this._router.navigate(['/lobby']);
      }
    });
  }

}
