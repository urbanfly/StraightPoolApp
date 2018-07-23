import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StraightPoolGamesService } from '../straight-pool-games.service';
import { StraightPoolGame } from '../straight-pool-game';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  constructor(private games: StraightPoolGamesService, private router: Router) { }

  ngOnInit() {
  }

  createGame() {
    const game = new StraightPoolGame();
    this.games.saveGame(game).subscribe(g => {
      this.router.navigate(['game', g.id]);
    });
  }
}
