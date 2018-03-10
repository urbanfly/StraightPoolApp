import { Component, OnInit, Input } from '@angular/core';
import { StraightPoolPlayer, StraightPoolGame } from '../straight-pool-rules.service';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css']
})
export class PlayersComponent implements OnInit {
  template = {
    name: 'Name',
    score: 'Score',
    fouls: 'Fouls',
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

}
