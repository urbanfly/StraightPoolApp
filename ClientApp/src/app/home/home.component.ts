import { Component, OnInit } from '@angular/core';
import { StraightPoolGamesService } from '../straight-pool-games.service';
import { StraightPoolGame } from '../straight-pool-game';
import { Observable } from 'rxjs';
import * as Moment from 'moment';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  games: Observable<StraightPoolGame[]>;

  constructor(private gamesService: StraightPoolGamesService) { }

  ngOnInit() {
    this.games = this.gamesService.listGames();
  }

  getGameMoment(game: StraightPoolGame): Moment.Moment {
    return Moment([2018, 7, 19, 23, 45]);
  }

  getGameChartData(game: StraightPoolGame): any {
    const data = {
      labels: null,
      datasets: game.players.map(p => ({
        label: p.name,
        data: game.getPlayerStatsByPlayer(p).playerTurns.map(t => t.totalPoints),
        fill: false,
        borderColor: game.players[0] === p ? 'red' : 'blue'
      }))
    };
    data.labels = Array(Math.max(...data.datasets.map(ds => ds.data.length))).fill(0).map((x, i) => i);

    return data;
  }
}
