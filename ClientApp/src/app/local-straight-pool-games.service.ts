import { Injectable } from '@angular/core';
import { StraightPoolGame } from './straight-pool-game';
import { Observable, of } from 'rxjs';
import { IStraightPoolGamesService } from './straight-pool-games.service';
import * as uuidv4 from 'uuid/v4';

@Injectable()
export class LocalStraightPoolGamesService implements IStraightPoolGamesService {
  loadGame(id: string): Observable<StraightPoolGame> {
    return of(new StraightPoolGame());
  }

  saveGame(game: StraightPoolGame): Observable<StraightPoolGame> {
    if (!game.id) {
      game.id = uuidv4();
    }

    return of(game);
  }
}
