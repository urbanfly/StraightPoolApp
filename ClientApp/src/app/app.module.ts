import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';
import { StraightPoolRulesService } from './straight-pool-rules.service';
import { PlayersComponent } from './players/players.component';
import { PlayerComponent } from './player/player.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatIconModule } from '@angular/material';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTableModule} from '@angular/material/table';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent,
    PlayersComponent,
    PlayerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    MatButtonModule,
    MatTabsModule,
    MatToolbarModule,
    MatGridListModule,
    MatTableModule,
    MatIconModule
  ],
  providers: [StraightPoolRulesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
