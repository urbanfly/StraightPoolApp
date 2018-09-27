import { Component, OnInit, Input } from '@angular/core';
import { StraightPoolGame } from '../straight-pool-game';

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.css']
})
export class GameDetailsComponent implements OnInit {
  @Input()
  game: StraightPoolGame;

  constructor() { }

  ngOnInit() {
  }

}
