import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { PlayerService } from '../player.service';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})

export class StatsComponent implements OnInit {

  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';

  showGameNum: number = 0;

  constructor(
    private playerService: PlayerService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _httpService: HttpService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    if(!this.playerService.username){
      this._router.navigate(['/']);
    }else{
      this.showGameNum = parseInt(this._route.snapshot.paramMap.get('id'));
      this.showGameNum = (this.showGameNum)?this.showGameNum:0;

      this.loadGameData(this.showGameNum);
    }
  }

  // lineChart
  public lineChartData:Array<any> = [
    {data: [0, 0, 0, 0, 0], label: 'Player 1'},
    {data: [0, 0, 0, 0, 0], label: 'Player 2'},
    {data: [0, 0, 0, 0, 0], label: 'Player 1 Average'}
  ];

  public lineChartLabels:Array<any> = ['Total Clears', 'Single Clear', 'Double Clear', 'Triple Clear', 'Tetris Clear'];

  public lineChartOptions:any = {
    responsive: true
  };
  
  public lineChartColors:Array<any> = [
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(179, 0, 0,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // red
      backgroundColor: 'rgba(199, 2, 2,0.2)',
      borderColor: 'rgba(152, 0, 0,1)',
      pointBackgroundColor: 'rgba(152, 0, 0,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(152, 0, 0,0.8)'
    }
  ];

  public loadGameData(gameNum):void {
    this.showGameNum = gameNum;
    if(this.playerService['games']){
      let game = this.playerService['games'][gameNum];
      let opponent_game;

      console.log('*** opponent_id: '+game.opponent_id);
      let getOpponent = this._httpService.getUserGame(game.opponent_id, game.game_id);
      getOpponent.subscribe(data => {
        if(data['message'] == 'Error'){
          console.log(data);
        }else if(data['game']){
          console.log(data['game'])
          opponent_game = data['game'].games[0];

          let total_clears = game.single_clear + game.double_clear + game.triple_clear + game.tetris_clear;
          let opponent_total_clears = opponent_game.single_clear + opponent_game.double_clear + opponent_game.triple_clear + opponent_game.tetris_clear;
          let average_score = 0, average_clears = 0, average_singles = 0, average_doubles = 0, average_triples = 0, average_tetris = 0;
          let game_len = this.playerService['games'].length;

          for(let i=0; i<game_len; i++){
            let currGame = this.playerService['games'][i];
            // average_score += currGame.score;
            average_clears += currGame.single_clear + currGame.double_clear + currGame.triple_clear + currGame.tetris_clear;
            average_singles += currGame.single_clear;
            average_doubles += currGame.double_clear;
            average_triples += currGame.triple_clear;
            average_tetris += currGame.tetris_clear;
          }

          // average_score /= game_len
          average_clears /= game_len;
          average_singles /= game_len;
          average_doubles /= game_len;
          average_triples /= game_len;
          average_tetris /= game_len;

          this.lineChartData = [
            {data: [total_clears, game.single_clear, game.double_clear, game.triple_clear, game.tetris_clear], label: this.playerService.username},
            {data: [opponent_total_clears, opponent_game.single_clear, opponent_game.double_clear, opponent_game.triple_clear, opponent_game.tetris_clear], label: game.opponent_name},
            {data: [average_clears, average_singles, average_doubles, average_triples, average_tetris], label: this.playerService.username + ' Average'}
          ];
        }
      });
    }
  }
 
  public randomize():void {
    let _lineChartData:Array<any> = new Array(this.lineChartData.length);
    for (let i = 0; i < this.lineChartData.length; i++) {
      _lineChartData[i] = {data: new Array(this.lineChartData[i].data.length), label: this.lineChartData[i].label};
      for (let j = 0; j < this.lineChartData[i].data.length; j++) {
        _lineChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
      }
    }
    this.lineChartData = _lineChartData;
  }

}
