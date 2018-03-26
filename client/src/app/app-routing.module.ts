import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { PodComponent } from './landing/pod/pod.component';
import { LoginComponent } from './landing/login/login.component';
import { RegisterComponent } from './landing/register/register.component';
import { StatsComponent } from './stats/stats.component';
import { TetrisBoardComponent } from './tetris-board/tetris-board.component';

const routes: Routes = [
  {
    path: 'landing',
    component: LandingComponent,
    children: [
      {path: 'pod', component: PodComponent},
      {path: 'login', component: LoginComponent},
      {path: 'register', component: RegisterComponent},
      {path: '', pathMatch: 'prefix', redirectTo: 'login'}
    ]
  },
  {path: 'stats', component: StatsComponent},
  { path: 'tetris-board', component: TetrisBoardComponent },
  { path: '', pathMatch: 'full', redirectTo: '/landing/login' },
  { path: '**', component: PodComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
