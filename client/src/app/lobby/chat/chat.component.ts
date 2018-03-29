import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { HttpService } from '../../http.service';
import { PlayerService } from '../../player.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

// import * as io from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messages') private _chatLayer: ElementRef
  message: String;
  allMessages: any;

  constructor(
    private playerService: PlayerService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _httpService: HttpService
  ) { }

  ngOnInit(){
    this.allMessages = [];

    if(!this.playerService.username){
      this._router.navigate(['/']);
    }else{
      this.playerService.socket.on('messageReceived', (data) => {
        this.allMessages.push(data);
      });
    }
  }

  ngAfterViewChecked(){
    try{
      this._chatLayer.nativeElement.scrollTop = this._chatLayer.nativeElement.scrollHeight;
    }catch(err){}
  } 

  sendMessage(){
    this.playerService.socket.emit('sendMessage', { username: this.playerService.username, message: this.message});
    this.message = '';
  }

}
