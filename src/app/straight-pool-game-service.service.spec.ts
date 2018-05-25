import { TestBed, inject } from '@angular/core/testing';

import { StraightPoolGameServiceService } from './straight-pool-game-service.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { StraightPoolGame } from './straight-pool-game';
import { StraightPoolTurn } from './straight-pool-turn';
import { StraightPoolPlayer } from './straight-pool-player';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('StraightPoolGameServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StraightPoolGameServiceService],
      imports: [ HttpClientTestingModule ]
    });
  });

  it('should be created', inject([StraightPoolGameServiceService], (service: StraightPoolGameServiceService) => {
    expect(service).toBeTruthy();
  }));

  fit('Can load remote games', inject([HttpTestingController, HttpClient], (controller: HttpTestingController, client: HttpClient) => {
    // TODO: use the service instead of HttpClient directly
    client.get<StraightPoolGame>('http://localhost/games/1').subscribe(game => {
      const g = Object.assign(new StraightPoolGame(), game);
      g.players = g.players.map(p => Object.assign(new StraightPoolPlayer(), p));
      g.turns = g.turns.map(t => Object.assign(new StraightPoolTurn(), t));
      console.log(g);
      expect(g instanceof StraightPoolGame).toBeTruthy();
      expect(g.turns.length).toEqual(2);
    });

    const req = controller.expectOne('http://localhost/games/1');
    expect(req).toBeTruthy();
    req.flush({
      'pointLimit': 100,
      'turns': [
          {
              'player': 'Player2',
              'ending': 'Safety',
              'ballsMade': 0,
              'points': 0,
              'successfulSafety': true
          },
          {
              'player': 'Player1',
              'ending': 'Foul',
              'ballsMade': 0,
              'points': -1
          }
      ],
      'ballsRemaining': 8,
      'players': [
          {
              'id': 'player1',
              'name': 'Player 1'
          },
          {
              'id': 'player2',
              'name': 'Player 2'
          }
      ],
      'currentPlayerIndex': 0
  });
  }));
});
