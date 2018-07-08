import { Component, OnInit, Input } from '@angular/core';
import { StraightPoolPlayerStats } from '../straight-pool-player-stats';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  @Input() player: StraightPoolPlayerStats;
  @Input() isActive: boolean;

  constructor() { }

  ngOnInit() {
  }

}
