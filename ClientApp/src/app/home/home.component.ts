import { Component, OnInit } from '@angular/core';
import { StraightPoolGamesService } from '../straight-pool-games.service';
import { StraightPoolGame } from '../straight-pool-game';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  games: Observable<StraightPoolGame[]>;

  constructor(private gamesService: StraightPoolGamesService) { }

  ngOnInit() {
    this.games = this.gamesService.listGames();
  }

}
