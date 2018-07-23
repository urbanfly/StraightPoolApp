import { Injectable } from '@angular/core';
import { StraightPoolGame } from './straight-pool-game';
import { Observable, of } from 'rxjs';
import { IStraightPoolGamesService } from './straight-pool-games.service';
import * as uuidv4 from 'uuid/v4';

@Injectable()
export class LocalStraightPoolGamesService implements IStraightPoolGamesService {
  private games: { [id: string]: StraightPoolGame; } = { };

  loadGame(id: string): Observable<StraightPoolGame> {
    return of(this.games[id] || new StraightPoolGame());
  }

  saveGame(game: StraightPoolGame): Observable<StraightPoolGame> {
    if (!game.id) {
      game.id = uuidv4();
    }

    this.games[game.id] = game;

    return of(game);
  }
}
