import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { StraightPoolGame } from '../straight-pool-game';

@Component({
  selector: 'app-chart-score',
  templateUrl: './chart-score.component.html',
  styleUrls: ['./chart-score.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartScoreComponent implements OnInit {
  chartOptions = {
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        id: 'A',
        type: 'linear',
        position: 'left',
        scaleLabel: {
          display: true,
          labelString: 'avg'
        }
      }, {
        id: 'B',
        type: 'linear',
        position: 'right',
        scaleLabel: {
          display: true,
          labelString: 'score'
        }
      }],
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'innings'
          }
        }
      ]
    },
    legend: {
      display: true
    }
  };

  @Input()
  game: StraightPoolGame;

  @Input()
  includeHandicap: boolean;

  constructor() { }

  ngOnInit() {
  }

  getGameChartData(): any {
    const runningTotals = this.game.players.map(p => ({
      player: p,
      label: `${p.name} Score`,
      data: this.game.getPlayerStatsByPlayer(p).playerTurns
            .map(t => t.totalPoints)
            .reduce(function(r, a) {
              r.push(r[r.length - 1] + a);
              return r;
            }, [(this.includeHandicap ? p.handicapPoints : 0)]),
      fill: false,
      borderColor: this.game.players[0] === p ? 'red' : 'blue',
      cubicInterpolationMode: 'monotone',
      pointRadius: 0,
      yAxisID: this.chartOptions.scales.yAxes[1].id
    }));

    const runningAvg = runningTotals.map(rt => ({
      player: rt.player,
      label: `${rt.player.name} Running Avg`,
      data: rt.data.map((t, i) => (t - (this.includeHandicap ? rt.player.handicapPoints : 0)) / (i + 1)),
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
