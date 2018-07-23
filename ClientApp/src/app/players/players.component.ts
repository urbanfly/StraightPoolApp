import { Component, OnInit, Input } from '@angular/core';
import { StraightPoolGame } from '../straight-pool-game';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  template = {
    top5HighRuns: 'Top 5',
    totalFouls: 'Total Fouls',
    totalMisses: 'Total Misses',
    totalSafeties: 'Total Safeties',
    totalSuccessfulSafeties: 'Total Successful Safeties',
    totalFinishedRacks: 'Total Finished Racks',
    totalErrors: 'Total Errors'
  };
  objectKeys = Object.keys;
  @Input() game: StraightPoolGame;

  constructor() { }

  ngOnInit() {
  }

  get stats(): any[] {
    if (this.game === undefined || this.game.players === undefined) {
      return null;
    }

    const playerStats = this.game.players.map((p, i) => this.game.getPlayerStats(i));
    return Object.keys(this.template).map(k => {
      const o = { title: k };
      playerStats.forEach(p => o[p.playerName] = p[k]);
      return o;
    });
  }
}
