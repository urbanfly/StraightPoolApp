import { Component, OnInit, Input } from '@angular/core';
import { StraightPoolGame } from '../straight-pool-game';

@Component({
  selector: 'app-chart-dist',
  templateUrl: './chart-dist.component.html',
  styleUrls: ['./chart-dist.component.css']
})
export class ChartDistComponent implements OnInit {
  normDistOptions = {
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        gridLines: {
          display: false,
        },
        ticks: {
          display: false
        },
        scaleLabel: {
          display: true,
          labelString: 'probability'
        }
      }],
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'balls/inning'
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

  constructor() { }

  ngOnInit() {
  }

  get gameNormDistChartData(): any {
    const data = {
      labels: new Array(20).fill(0).map((v, i) => i),
      datasets: this.game.players.map(p => {
        const stats = this.game.getPlayerStatsByPlayer(p);
        const mean = stats.avgBallsPerTurn;
        const stdv = stats.standardDeviation;
        return {
          label: `${p.name} Normal Dist.`,
          data: new Array(20).fill(0).map((v, i) => pdf(i, mean, stdv)),
          fill: true,
          borderColor: this.game.players[0] === p ? 'red' : 'blue',
          backgroundColor: this.game.players[0] === p ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 0, 255, 0.1)',
          pointRadius: 0
        };
      })
    };

    return data;

    function pdf(x, mean, std) {
      return Math.exp(-0.5 * Math.log(2 * Math.PI) -
             Math.log(std) - Math.pow(x - mean, 2) / (2 * std * std));
    }
  }
}
