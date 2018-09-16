import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { StraightPoolGamesService } from '../straight-pool-games.service';
import { StraightPoolGame } from '../straight-pool-game';
import { Observable, from } from 'rxjs';
import * as Moment from 'moment';
import { MatDialog, MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  games: Observable<StraightPoolGame[]>;
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
    }
  };

  @ViewChild('deleteConfirmation') deleteConfirmation: TemplateRef<any>;

  constructor(private gamesService: StraightPoolGamesService,
              private dialogService: MatDialog,
              private snackbar: MatSnackBar,
              private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this.updateGameList();
  }

  private updateGameList() {
    this.games = this.gamesService.listGames();
    this.changeDetector.detectChanges();
  }

  getGameMoment(game: StraightPoolGame): Moment.Moment {
    return Moment([2018, 7, 19, 23, 45]);
  }

  getGameChartData(game: StraightPoolGame): any {
    const runningTotals = game.players.map(p => ({
      playerName: p.name,
      label: `${p.name} Score`,
      data: game.getPlayerStatsByPlayer(p).playerTurns.map(t => t.totalPoints).reduce(function(r, a) {
        r.push((r.length && r[r.length - 1] || 0) + a);
        return r;
      }, []),
      fill: false,
      borderColor: game.players[0] === p ? 'red' : 'blue',
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

  giveHint() {
    this.snackbar.open('Long press to delete', null, {duration: 1000});
  }

  deleteGame(id: string) {
    this.dialogService.open(this.deleteConfirmation)
      .afterClosed()
      .subscribe(result => {
        if (result === 'delete') {
          this.gamesService
            .deleteGame(id)
            .toPromise()
            .then(() => this.updateGameList());
        }
      });
  }
}
