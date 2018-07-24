import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StraightPoolGamesService } from '../straight-pool-games.service';
import { StraightPoolGame } from '../straight-pool-game';
import { StraightPoolPlayer } from '../straight-pool-player';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  params: GameParameters = {
    raceTo: 100,
    player0Handicap: 0,
    player1Handicap: 0
  };

  constructor(private games: StraightPoolGamesService, private router: Router) { }

  ngOnInit() {
  }

  onLimitPanned(e: HammerInput) {
    const distance = Math.round(e.distance * e.velocityX * .1);
    this.params.raceTo = Math.max(0, Math.min((this.params.raceTo || 0) + distance, 1000));
  }

  onHandicapPanned(player: number, e: HammerInput) {
    const distance = Math.round(e.distance * e.velocityX * .1);
    const currentValue = this.params[`player${player}Handicap`];
    this.params[`player${player}Handicap`] = Math.max(0, Math.min((currentValue || 0) + distance, this.params.raceTo));
  }

  createGame() {
    const game = new StraightPoolGame(this.params.raceTo, [
      new StraightPoolPlayer(this.params.player0Name),
      new StraightPoolPlayer(this.params.player1Name)
    ]);
    this.games.saveGame(game).subscribe(g => {
      this.router.navigate(['game', g.id]);
    });
  }
}

class GameParameters {
  raceTo: number;
  player0Name?: string;
  player0Handicap: number;
  player1Name?: string;
  player1Handicap: number;
}
