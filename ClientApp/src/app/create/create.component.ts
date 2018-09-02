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

  createGame() {
    const game = new StraightPoolGame(this.params.raceTo, [
      new StraightPoolPlayer(this.params.player0Name),
      new StraightPoolPlayer(this.params.player1Name)
    ]);
    this.games.saveGame(game).subscribe(g => {
      this.router.navigate(['game', g.id], {replaceUrl: true});
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
