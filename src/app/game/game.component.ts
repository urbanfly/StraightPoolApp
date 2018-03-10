import { Component, OnInit } from '@angular/core';
import { StraightPoolRulesService, StraightPoolGame, StraightPoolPlayer, StraightPoolTurn
  , EndingType } from '../straight-pool-rules.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  game: StraightPoolGame;
  ballsRemaining = 15;

  constructor(public rules: StraightPoolRulesService) {
    this.game = rules.currentGame = rules.newGame();
   }

  ngOnInit() {
  }

  private endTurn(ending: EndingType, ballsRemaining: number = this.ballsRemaining) {
    this.game.endTurn(ending, ballsRemaining);
    this.ballsRemaining = this.game.ballsRemaining;
  }

  miss() { this.endTurn(EndingType.Miss); }
  foul() { this.endTurn(EndingType.Foul); }
  breakingFoul() { this.endTurn(EndingType.BreakingFoul); }
  safety() { this.endTurn(EndingType.Safety); }

  newRack(ballsRemaining: number) { this.endTurn(EndingType.NewRack, ballsRemaining); }
}
