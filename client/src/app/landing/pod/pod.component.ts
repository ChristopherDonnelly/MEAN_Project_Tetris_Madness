import { Component, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { HttpService } from '../../http.service';
import { PlayerService } from '../../player.service';
import { ActivatedRoute, Params, Router } from '@angular/router';


@Component({
  selector: 'app-pod',
  templateUrl: './pod.component.html',
  styleUrls: ['./pod.component.css']
})
export class PodComponent implements OnInit {

  user: any;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute,
    private _httpService: HttpService
  ) { }

  ngOnInit() {
    this.user = {username: '', score: 0}
    this.getPOD();
  }

  getPOD(){
    let getPlayer = this._httpService.getPOD();
    getPlayer.subscribe(data => {
      if(data['message'] == 'Error'){
        console.log(data);
      }else if(data['user']){
        this.user.username = data['user'].username;
        this.user.score = data['user'].score;
      }
    });
  }
}
