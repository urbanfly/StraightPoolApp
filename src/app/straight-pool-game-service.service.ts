import { Injectable, InjectionToken, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StraightPoolGame } from './straight-pool-game';
import { Observable } from 'rxjs/Observable';
import { StraightPoolPlayer } from './straight-pool-player';
import { StraightPoolTurn } from './straight-pool-turn';
import 'rxjs/add/operator/map';

// TODO: rename to get rid of ServiceService

export const BASE_URL = new InjectionToken<string>('BaseUrl');

@Injectable()
export class StraightPoolGameServiceService {

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
    return this.client.get<StraightPoolGame>(`${this.baseUrl}${id}`).map(this.hydrate);
  }

  public saveGame(game: StraightPoolGame): Observable<StraightPoolGame> {
    return this.client.put(`${this.baseUrl}${game.id}`, game).map(this.hydrate);
  }
}
