import { ActivatedRouteSnapshot } from '@angular/router';
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
  @ViewChild('gameTabs') gameTabs: MatTabGroup;
  private newRackSnackBarRef: MatSnackBarRef<SimpleSnackBar>;
  chartOptions = {
    scales: {
      yAxes: [{
        id: 'A',
        type: 'linear',
        position: 'left'
      }, {
        id: 'B',
        type: 'linear',
        position: 'right'
      }]
    },
    legend: {
      display: false
    },
  };

  constructor(private games: StraightPoolGamesService,
    private snackBar: MatSnackBar,
    private route: ActivatedRouteSnapshot,
    private location: Location) {
  }

  ngOnInit() {
    const id = this.route.paramMap.get('id');
    this.games.loadGame(id).subscribe(g => {
      console.log('loaded game', g);
      this.game = g;
      this.update();
    });

    this.noSleep.enable();
  }

  ngAfterViewInit() {
    this.gameTabs.selectedIndex = +this.route.queryParamMap.get('index') || 0;
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
    return this.game.pointLimit - stats.score;
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

  get gameChartData(): any {
    const runningTotals = this.game.players.map(p => ({
      playerName: p.name,
      label: `${p.name} Score`,
      data: this.game.getPlayerStatsByPlayer(p).playerTurns.map(t => t.totalPoints).reduce(function(r, a) {
        r.push((r.length && r[r.length - 1] || 0) + a);
        return r;
      }, []),
      fill: false,
      borderColor: this.game.players[0] === p ? 'red' : 'blue',
      cubicInterpolationMode: 'monotone',
      pointRadius: 0,
      yAxisID: this.chartOptions.scales.yAxes[1].id
    }));

    const runningAvg = runningTotals.map(rt => ({
      playerName: rt.playerName,
      label: `${rt.playerName} Running Avg`,
      data: rt.data.map((t, i2) => t / (i2 + 1)),
      fill: false,
      borderColor: rt.borderColor,
      borderDash: [5, 5],
      borderWidth: 1,
      cubicInterpolationMode: 'monotone',
      pointRadius: 0,
      yAxisID: this.chartOptions.scales.yAxes[0].id
    }));

    const data = {
      labels: null,
      datasets: runningTotals.concat(runningAvg),
    };
    data.labels = Array(Math.max(...data.datasets.map(ds => ds.data.length))).fill(0).map((x, i) => i);

    return data;
  }
}
