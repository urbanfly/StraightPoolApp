import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { StraightPoolRulesService } from './straight-pool-rules.service';
import { PlayersComponent } from './players/players.component';
import { PlayerComponent } from './player/player.component';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    PlayersComponent,
    PlayerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [StraightPoolRulesService],
  bootstrap: [AppComponent]
})
export class AppModule { }