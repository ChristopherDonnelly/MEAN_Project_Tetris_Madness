import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

import { HttpService } from './http.service';
import { HttpClientModule } from '@angular/common/http';

import { PlayerService } from './player.service';

import { LandingComponent } from './landing/landing.component';
import { PodComponent } from './landing/pod/pod.component';
import { LoginComponent } from './landing/login/login.component';
import { RegisterComponent } from './landing/register/register.component';
import { StatsComponent } from './stats/stats.component';
import { TetrisBoardComponent } from './tetris-board/tetris-board.component';
import { LobbyComponent } from './lobby/lobby.component';
import { ChatComponent } from './lobby/chat/chat.component';

// Import tetris library
// import { NGTrisModule } from 'ngtris';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    LoginComponent,
    RegisterComponent,
    PodComponent,
    StatsComponent,
    TetrisBoardComponent,
    LobbyComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [HttpService, PlayerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
