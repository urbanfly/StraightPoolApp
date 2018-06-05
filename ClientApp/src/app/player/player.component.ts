import { Component, OnInit, Input } from '@angular/core';
import { StraightPoolPlayer } from '../straight-pool-player';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  @Input() player: StraightPoolPlayer;
  @Input() isActive: boolean;

  constructor() { }

  ngOnInit() {
  }

}
