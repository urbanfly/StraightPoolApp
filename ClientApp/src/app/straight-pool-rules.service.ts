import { Injectable } from '@angular/core';
import { StraightPoolGame } from './straight-pool-game';

@Injectable()
export class StraightPoolRulesService {
  currentGame: StraightPoolGame;

  newGame(): StraightPoolGame {
    return new StraightPoolGame();
  }

  constructor() { }

}
