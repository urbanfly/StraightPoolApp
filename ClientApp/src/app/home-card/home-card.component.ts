import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { StraightPoolGame } from '../straight-pool-game';
import * as Moment from 'moment';

@Component({
  selector: 'app-home-card',
  templateUrl: './home-card.component.html',
  styleUrls: ['./home-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeCardComponent implements OnInit {
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

  @Input()
  game: StraightPoolGame;

  @Output()
  deleting = new EventEmitter<StraightPoolGame>();

  constructor() { }

  ngOnInit() {
  }

  deleteGame() {
    this.deleting.emit(this.game);
  }

  getGameMoment(): Moment.Moment {
    return Moment([2018, 7, 19, 23, 45]);
  }

  getGameChartData(): any {
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
