import { TestBed, inject } from '@angular/core/testing';
import { throws } from 'assert';
import { StraightPoolRulesService } from './straight-pool-rules.service';

describe('StraightPoolRulesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StraightPoolRulesService]
    });
  });

  it('should be created', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    expect(service).toBeTruthy();
  }));

  it('can create a game', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(game).not.toBeNull();
  }));

  it('creates games with valid defaults', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(game.pointLimit).toEqual(100);
    expect(game.ballsRemaining).toEqual(15);
    expect(game.players.length).toEqual(2);
    expect(game.currentPlayer).toBe(game.players[0]);
    expect(game.turns).not.toBeNull();
  }));

});
