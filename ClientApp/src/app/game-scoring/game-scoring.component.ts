import { Component, OnInit, Input } from '@angular/core';
import { StraightPoolGame } from '../straight-pool-game';

@Component({
  selector: 'app-game-scoring',
  templateUrl: './game-scoring.component.html',
  styleUrls: ['./game-scoring.component.css']
})
export class GameScoringComponent implements OnInit {
  @Input()
  game: StraightPoolGame;

  @Input()
  includeHandicap: boolean;

  constructor() { }

  ngOnInit() {
  }

}
