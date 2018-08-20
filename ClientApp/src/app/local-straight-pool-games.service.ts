import { Injectable } from '@angular/core';
import { StraightPoolGame } from './straight-pool-game';
import { Observable, of, from } from 'rxjs';
import { IStraightPoolGamesService } from './straight-pool-games.service';
import * as uuidv4 from 'uuid/v4';
import idb, { DB } from 'idb';
import { StraightPoolPlayer } from './straight-pool-player';
import { StraightPoolTurn } from './straight-pool-turn';

@Injectable()
export class LocalStraightPoolGamesService implements IStraightPoolGamesService {
  private _db: Promise<DB>;
  private games: { [id: string]: StraightPoolGame; } = { };

  private hydrate(game: any): StraightPoolGame {
    const g = Object.assign(new StraightPoolGame(), game);
    g.players = g.players.map(p => Object.assign(new StraightPoolPlayer(), p));
    g.turns = g.turns.map(hydrateTurn);
    return g;

    function hydrateTurn(turn: any): StraightPoolTurn {
      if (turn === null) {
        return null;
      }
      const result: StraightPoolTurn = Object.assign(new StraightPoolTurn(), turn);
      result.continuation = hydrateTurn(result.continuation);
      return result;
    }
  }

  constructor() {
    this._db = idb.open('games', 1, db => {
      db.createObjectStore('games');
    });
  }

  loadGame(id: string): Observable<StraightPoolGame> {
    return from(this._db
      .then(db => db
        .transaction('games')
        .objectStore('games')
        .get(id)
        .then(this.hydrate)));
  }

  saveGame(game: StraightPoolGame): Observable<StraightPoolGame> {
    if (!game.id) {
      game.id = uuidv4();
    }

    return from(this._db
      .then(db => db
        .transaction('games', 'readwrite')
        .objectStore('games')
        .put(game, game.id)
        .then(key => game)));
  }

  listGames(): Observable<StraightPoolGame[]> {
    return from(this._db
      .then(db => db
        .transaction('games')
        .objectStore('games')
        .getAll()
        .then(vals => vals.map(this.hydrate))));
  }
}
