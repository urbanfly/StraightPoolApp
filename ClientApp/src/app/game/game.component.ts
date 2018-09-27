import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { StraightPoolGamesService } from '../straight-pool-games.service';
import { StraightPoolGame } from '../straight-pool-game';
import { StraightPoolTurn } from '../straight-pool-turn';
import { MatTabGroup } from '@angular/material';
import * as NoSleep from 'nosleep.js';
import { GameScoringComponent } from '../game-scoring/game-scoring.component';
import { EndingType } from '../straight-pool-ending-type.enum';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameComponent implements OnInit, OnDestroy, AfterViewInit {
  game: StraightPoolGame;
  ballsRemaining: number;
  noSleep = new NoSleep();
  ballsToWin: number;
  includeHandicap = true;

  @ViewChild('gameTabs') gameTabs: MatTabGroup;

  @ViewChild(GameScoringComponent) scoring: GameScoringComponent;

  constructor(private games: StraightPoolGamesService,
    private route: ActivatedRoute,
    private location: Location) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.games.loadGame(id).subscribe(g => {
      console.log('loaded game', g);
      this.game = g;
    });
  }

  ngAfterViewInit() {
    this.gameTabs.selectedIndex = +this.route.snapshot.queryParamMap.get('index') || 0;
    this.noSleep.enable();
  }

  ngOnDestroy() {
    this.noSleep.disable();
  }

  gameTabChanged(index: number) {
    this.location.replaceState(location.pathname, `index=${index}`);
  }

  toggleHandicap() {
    this.includeHandicap = !this.includeHandicap;
  }

  gameChanged(turn: StraightPoolTurn) {
    this.games.saveGame(this.game);
    if (turn.ending === EndingType.Win) {
      this.noSleep.disable();
    } else {
      this.noSleep.enable();
    }
  }

  undo() {
    const turn = this.game.undo();
    this.gameChanged(turn);
    this.scoring.update();
  }
}
