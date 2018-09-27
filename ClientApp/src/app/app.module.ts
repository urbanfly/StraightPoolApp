import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { PlayersComponent } from './players/players.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './home/home.component';
import { CreateComponent } from './create/create.component';
import { AppRoutingModule } from './app-routing.module';
import { BASE_URL, StraightPoolGamesService } from './straight-pool-games.service';
import { LocalStraightPoolGamesService } from './local-straight-pool-games.service';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material/material.module';
import { ChartModule } from 'angular2-chartjs';
import { HomeCardComponent } from './home-card/home-card.component';
import { ChartScoreComponent } from './chart-score/chart-score.component';
import { ChartDistComponent } from './chart-dist/chart-dist.component';
import { GameScoringComponent } from './game-scoring/game-scoring.component';
import { GameWinScreenComponent } from './game-win-screen/game-win-screen.component';
import { GameDetailsComponent } from './game-details/game-details.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    PlayersComponent,
    HomeComponent,
    CreateComponent,
    HomeCardComponent,
    ChartScoreComponent,
    ChartDistComponent,
    GameScoringComponent,
    GameWinScreenComponent,
    GameDetailsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    ChartModule
  ],
  providers: [
    { provide: BASE_URL, useValue: 'http://localhost/api/games' },
    { provide: StraightPoolGamesService, useClass: LocalStraightPoolGamesService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
