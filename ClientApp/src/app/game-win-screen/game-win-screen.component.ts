import { Component, OnInit, Input } from '@angular/core';
import { StraightPoolGame } from '../straight-pool-game';

@Component({
  selector: 'app-game-win-screen',
  templateUrl: './game-win-screen.component.html',
  styleUrls: ['./game-win-screen.component.css']
})
export class GameWinScreenComponent implements OnInit {
  @Input()
  game: StraightPoolGame;

  @Input()
  includeHandicap: boolean;

  constructor() { }

  ngOnInit() {
  }

}
