import { Component, OnInit } from '@angular/core';
import { StraightPoolRulesService } from '../straight-pool-rules.service';
import { StraightPoolGame } from '../straight-pool-game';
import { EndingType } from '../straight-pool-ending-type.enum';
import { StraightPoolTurn } from '../straight-pool-turn';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  game: StraightPoolGame;
  ballsRemaining = 15;
  obsTurns = new Subject<StraightPoolTurn[]>();

  constructor(public rules: StraightPoolRulesService) {
    this.game = rules.currentGame = rules.newGame();
   }

  ngOnInit() {
  }

  private endTurn(ending: EndingType, ballsRemaining: number = this.ballsRemaining) {
    this.game.endTurn(ending, ballsRemaining);
    this.ballsRemaining = this.game.ballsRemaining;

    this.obsTurns.next(this.game.turns);
  }

  miss() { this.endTurn(EndingType.Miss); }
  foul() { this.endTurn(EndingType.Foul); }
  breakingFoul() { this.endTurn(EndingType.BreakingFoul); }
  safety() { this.endTurn(EndingType.Safety); }

  newRack(ballsRemaining: number) { this.endTurn(EndingType.NewRack, ballsRemaining); }
}
