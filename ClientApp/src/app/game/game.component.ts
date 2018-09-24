import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { StraightPoolGamesService } from '../straight-pool-games.service';
import { StraightPoolGame } from '../straight-pool-game';
import { EndingType } from '../straight-pool-ending-type.enum';
import { StraightPoolTurn } from '../straight-pool-turn';
import { MatSnackBar, MatTabGroup, MatSnackBarRef, SimpleSnackBar } from '@angular/material';
import * as NoSleep from 'nosleep.js';

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
  private newRackSnackBarRef: MatSnackBarRef<SimpleSnackBar>;

  constructor(private games: StraightPoolGamesService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private location: Location) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.games.loadGame(id).subscribe(g => {
      console.log('loaded game', g);
      this.game = g;
      this.update();
    });

    this.noSleep.enable();
  }

  ngAfterViewInit() {
    this.gameTabs.selectedIndex = +this.route.snapshot.queryParamMap.get('index') || 0;
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
    this.newRackSnackBarRef = this.snackBar.open('Nice job!', 'Include 15th ball', { duration: 5000 });
    this.newRackSnackBarRef.onAction().subscribe(() => {
      turn.include15thBall();
      this.saveAndUpdate();
    });
  }

  undo() {
    const turn = this.game.undo();
    this.saveAndUpdate();
  }

  setBallsRemaining(ballsRemaining: number) {
    this.hideSnackBar();
    this.ballsRemaining = ballsRemaining;
  }

  private calcBallsToWin(): number {
    const stats = this.game.getPlayerStats(this.game.currentPlayerIndex);
    return this.game.pointLimit - stats.scoreWithHandicap;
  }

  private saveAndUpdate() {
    this.hideSnackBar();
    this.update();
    this.games.saveGame(this.game);
  }

  private update() {
    this.ballsRemaining = this.game.ballsRemaining;
    this.ballsToWin = this.calcBallsToWin();
  }

  private hideSnackBar() {
    if (this.newRackSnackBarRef) {
      this.newRackSnackBarRef.dismiss();
      this.newRackSnackBarRef = null;
    }
  }

  win(ballsRemaining: number) {
    this.endTurn(EndingType.Win, ballsRemaining);
  }
}
