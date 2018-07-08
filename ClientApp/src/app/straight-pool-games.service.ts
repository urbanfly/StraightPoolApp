import { Injectable, InjectionToken, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StraightPoolGame } from './straight-pool-game';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { StraightPoolPlayer } from './straight-pool-player';
import { StraightPoolTurn } from './straight-pool-turn';

import * as uuidv4 from 'uuid/v4';

export const BASE_URL = new InjectionToken<string>('BaseUrl');

@Injectable()
export class StraightPoolGamesService {

  constructor(private client: HttpClient, @Inject(BASE_URL) public baseUrl: string) {
    if (baseUrl[baseUrl.length - 1] !== '/') {
      this.baseUrl += '/';
    }
  }

  private hydrate(game: any): StraightPoolGame {
    const g = Object.assign(new StraightPoolGame(), game);
    g.players = g.players.map(p => Object.assign(new StraightPoolPlayer(), p));
    g.turns = g.turns.map(t => Object.assign(new StraightPoolTurn(), t));
    return g;
  }

  public loadGame(id: string): Observable<StraightPoolGame> {
    return this.client.get<StraightPoolGame>(`${this.baseUrl}${id}`).pipe(map(this.hydrate));
  }

  public saveGame(game: StraightPoolGame): Observable<StraightPoolGame> {
    if (!game.id) {
      game.id = uuidv4();
    }

    return this.client.put(`${this.baseUrl}${game.id}`, game).pipe(map(g => Object.assign(game, this.hydrate(g))));
  }
}
