import { TestBed, inject } from '@angular/core/testing';

import { StraightPoolGamesService, BASE_URL } from './straight-pool-games.service';
import { StraightPoolGame } from './straight-pool-game';
import { StraightPoolTurn } from './straight-pool-turn';
import { StraightPoolPlayer } from './straight-pool-player';
import { HttpClientTestingModule, HttpTestingController, RequestMatch } from '@angular/common/http/testing';
import { Injector } from '@angular/core';

describe('StraightPoolGameServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: BASE_URL, useValue: 'http://localhost/api/games' },
        StraightPoolGamesService
      ],
      imports: [ HttpClientTestingModule ]
    });
  });

  it('should be created', inject([StraightPoolGamesService], (service: StraightPoolGamesService) => {
    expect(service).toBeTruthy();
  }));

  it('baseUrl ends with /', inject([StraightPoolGamesService], (service: StraightPoolGamesService) => {
    expect(service.baseUrl).toEqual('http://localhost/api/games/');
  }));

  it('Can load remote games', inject([HttpTestingController, StraightPoolGamesService],
    (controller: HttpTestingController, service: StraightPoolGamesService) => {
    const game = service.loadGame('1').subscribe(g => {
      expect(g instanceof StraightPoolGame).toBeTruthy();
      expect(g).toBeTruthy();
      expect(g.turns.length).toBe(2);
      expect(g.players.length).toBe(2);
    });

    const req = controller.expectOne('http://localhost/api/games/1');
    expect(req).toBeTruthy();
    req.flush({
      'id': '6b9f464f-3f6b-4538-9d55-e65914404e9c',
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

    controller.verify();
  }));

  it('Populates a unique ID when saving', inject([HttpTestingController, StraightPoolGamesService],
    (controller: HttpTestingController, service: StraightPoolGamesService) => {
    const game = new StraightPoolGame();
    expect(game.id).toBeFalsy();

    service.saveGame(game).subscribe(g => {
      expect(g).toBeTruthy();
      expect(g instanceof StraightPoolGame).toBeTruthy();
      expect(g.id).toBeTruthy();
    });

    const req = controller.match(q => q.url.startsWith('http://localhost/api/games/'))[0];
    expect(req).toBeTruthy();
    req.flush(req.request.body, {status: 201, statusText: 'Created'});

    expect(game.id).toBeTruthy();

    controller.verify();
  }));

  it('PUTs to the game\'s id', inject([HttpTestingController, StraightPoolGamesService],
    (controller: HttpTestingController, service: StraightPoolGamesService) => {
    const game = new StraightPoolGame();

    expect(game.id).toBeFalsy();

    service.saveGame(game).subscribe(g => {
      expect(g).toBe(game);
    });

    expect(game.id).toBeTruthy();

    const req = controller.expectOne(`http://localhost/api/games/${game.id}`);
    req.flush(JSON.parse(JSON.stringify(req.request.body)), {status: 201, statusText: 'Created'});

    controller.verify();
  }));

  it('', inject([HttpTestingController, StraightPoolGamesService],
    (controller: HttpTestingController, service: StraightPoolGamesService) => {
    //
  }));
});
