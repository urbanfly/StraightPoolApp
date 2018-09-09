import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { StraightPoolGamesService } from '../straight-pool-games.service';
import { StraightPoolGame } from '../straight-pool-game';
import { EndingType } from '../straight-pool-ending-type.enum';
import { StraightPoolTurn } from '../straight-pool-turn';
import { MatSnackBar, MatTabGroup } from '@angular/material';
import * as NoSleep from 'nosleep.js';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy, AfterViewInit {
  game: StraightPoolGame;
  ballsRemaining: number;
  noSleep = new NoSleep();
  ballsToWin: number;
  @ViewChild('gameTabs') gameTabs: MatTabGroup;

  constructor(private games: StraightPoolGamesService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private location: Location) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.games.loadGame(id).subscribe(g => {
      this.game = g;
      this.update();
    });

    this.noSleep.enable();
  }

  ngAfterViewInit() {
    this.route.queryParamMap.subscribe(p => this.gameTabs.selectedIndex = +p.get('index') || 0);
  }

  ngOnDestroy() {
    this.noSleep.disable();
  }

  gameTabChanged(index: number) {
    this.location.replaceState(location.pathname, `index=${index}`);
  }

  miss() { this.endTurn(EndingType.Miss); }
  foul() { this.endTurn(EndingType.Foul); }
  breakingFoul() { this.endTurn(EndingType.BreakingFoul); }
  safety() { this.endTurn(EndingType.Safety); }

  private endTurn(ending: EndingType, ballsRemaining: number = this.ballsRemaining): StraightPoolTurn {
    // In case the sleep was cancelled, re-enable sleeping
    // - screen manually turned off
    // - switching apps
    this.noSleep.enable();

    const turn = this.game.endTurn(ending, ballsRemaining);

    this.saveAndUpdate();

    return turn;
  }

  newRack(ballsRemaining: number) {
    const turn = this.endTurn(EndingType.NewRack, ballsRemaining);
    const barRef = this.snackBar.open('Nice job!', 'Include 15th ball', { duration: 5000 });
    const sub = barRef.onAction().subscribe(() => {
      turn.include15thBall();
      this.saveAndUpdate();
    });
    barRef.afterDismissed().subscribe(() => sub.unsubscribe);
  }

  undo() {
    const turn = this.game.undo();
    this.saveAndUpdate();
  }

  private calcBallsToWin(): number {
    const stats = this.game.getPlayerStats(this.game.currentPlayerIndex);
    return this.game.pointLimit - stats.score;
  }

  private saveAndUpdate() {
    this.update();
    this.games.saveGame(this.game);
  }

  private update() {
    this.ballsRemaining = this.game.ballsRemaining;
    this.ballsToWin = this.calcBallsToWin();
  }

  win(ballsRemaining: number) {
    this.endTurn(EndingType.Miss, ballsRemaining);
  }
}
