import { Component, OnInit, Input } from '@angular/core';
import { StraightPoolPlayer, StraightPoolGame, StraightPoolPlayerStats } from '../straight-pool-rules.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  template = {
    playerName: 'Name',
    score: 'Score',
    avgBallsPerTurn: 'Avg',
    consecutiveFouls: 'Fouls',
    highRun: 'High Run',
    totalFouls: 'Total Fouls',
    totalMisses: 'Total Misses',
    totalSafeties: 'Total Safeties',
    totalSuccessfulSafeties: 'Total Successful Safeties',
    totalFinishedRacks: 'Total Finished Racks',
    totalErrors: 'TotalErrors'
  };
  private objectKeys = Object.keys;
  @Input() game: StraightPoolGame;

  constructor() { }

  ngOnInit() {
  }

  get stats(): StraightPoolPlayerStats[] {
    if (this.game === undefined || this.game.players === undefined) {
      return null;
    }
    return this.game.players.map((p, i) => this.game.getPlayerStats(i));
  }
}
