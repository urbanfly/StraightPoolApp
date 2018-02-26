import { TestBed, inject } from '@angular/core/testing';

import { StraightPoolRulesService, EndingType } from './straight-pool-rules.service';
import { throws } from 'assert';

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

  it('can switch players before a turn', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(game.canSwitchPlayers).toBeTruthy();

    let newPlayer = game.switchPlayers();
    expect (game.currentPlayer).toBe(newPlayer);
    expect(game.currentPlayer).toBe(game.players[1]);

    newPlayer = game.switchPlayers();
    expect (game.currentPlayer).toBe(newPlayer);
    expect(game.currentPlayer).toBe(game.players[0]);
  }));

  it('cannot switch players after a miss', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(15, EndingType.Miss);
    expect(game.canSwitchPlayers).toBeFalsy();
  }));

  it('can switch players after a breaking foul', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(15, EndingType.BreakingFoul);
    expect(game.canSwitchPlayers).toBeTruthy();
  }));

  it('can record a turn', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    const turn = game.endTurn(15, EndingType.Miss);

    expect(game.turns[0]).toBe(turn);

    expect(turn).not.toBeNull();
    expect(turn.ending).toEqual(EndingType.Miss);
    expect(turn.player).toBe(game.players[0]);
    expect(turn.points).toEqual(0);
  }));

  [EndingType.Miss, EndingType.BreakingFoul, EndingType.Foul, EndingType.Safety].forEach(element => {
    it(`switches players after a ${element}`, inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
      const game = service.newGame();
      const turn = game.endTurn(15, element);
      expect(game.currentPlayer).toBe(game.players[1]);
    }));
  });

  it('resets balls remaining on 3 consecutive fouls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(15, EndingType.Foul); // p1
    game.endTurn(14, EndingType.Foul); // p2
    game.endTurn(14, EndingType.Foul); // p1
    game.endTurn(13, EndingType.Foul); // p2
    const turn = game.endTurn(13, EndingType.Foul); // p1

    expect(turn.ending).toEqual(EndingType.ThreeConsecutiveFouls);
    expect(game.ballsRemaining).toEqual(15);
  }));

  it('resets balls remaining on new rack', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    const turn = game.endTurn(1, EndingType.NewRack); // p1

    expect(game.ballsRemaining).toEqual(15);
  }));

  [EndingType.ThreeConsecutiveFouls, EndingType.NewRack].forEach(element => {
    it(`does not switch players on ${element}`, inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
      const game = service.newGame();

      game.endTurn(1, element);

      expect(game.currentPlayer).toEqual(game.players[0]);
    }));
  });

  it('detects 3 consecutive fouls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(15, EndingType.Foul); // p1
    game.endTurn(15, EndingType.Foul); // p2
    game.endTurn(15, EndingType.Foul); // p1
    game.endTurn(15, EndingType.Foul); // p2
    const turn = game.endTurn(15, EndingType.Foul); // p1

    expect(turn.ending).toEqual(EndingType.ThreeConsecutiveFouls);
  }));

  it('does not count a foul with points as consecutive', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(15, EndingType.Foul); // p1
    game.endTurn(15, EndingType.Foul); // p2
    game.endTurn(15, EndingType.Foul); // p1
    game.endTurn(15, EndingType.Foul); // p2
    const turn = game.endTurn(14, EndingType.Foul); // p1; got one point

    expect(turn.ending).toEqual(EndingType.Foul);
  }));

  it('deducts 1 point for a foul', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    const turn = game.endTurn(15, EndingType.Foul);

    expect(turn.points).toEqual(-1);
  }));

  it('deducts 15 points for 3 consecutive fouls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(15, EndingType.Foul); // p1
    game.endTurn(15, EndingType.Foul); // p2
    game.endTurn(15, EndingType.Foul); // p1
    game.endTurn(15, EndingType.Foul); // p2
    const turn = game.endTurn(15, EndingType.Foul); // p1

    expect(turn.points).toEqual(-16); // -1 for normal foul + -15 for 3-consecutive
  }));

  it('deducts 2 point for a breaking foul', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    const turn = game.endTurn(15, EndingType.BreakingFoul);

    expect(turn.points).toEqual(-2);
  }));

  it('resets consecutive fouls after 3', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(15, EndingType.Foul); // p1
    game.endTurn(15, EndingType.Foul); // p2
    game.endTurn(15, EndingType.Foul); // p1
    game.endTurn(15, EndingType.Foul); // p2
    const turn = game.endTurn(15, EndingType.Foul); // p1

    expect(game.players[0].consecutiveFouls).toEqual(0);
  }));

  it('throws if attempt NewRack with >1 ball remaining', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    throws(() => {
      game.endTurn(15, EndingType.NewRack);
    });
  }));

  it('throws if turns ends with "extra" balls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(10, EndingType.Miss);
    throws(() => {
      game.endTurn(11, EndingType.Miss);
    });
  }));

  it('detects winning', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.pointLimit = 20;
    game.endTurn(1, EndingType.NewRack); // p1; score=14
    game.endTurn(1, EndingType.NewRack); // p1; score=28

    expect(game.winner).toBe(game.players[0]);
    expect(game.hasWinner).toBeTruthy();
  }));

  it('plays an example game', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.pointLimit = 25;

    game.endTurn(5, EndingType.Miss);
    expect(game.players[0].score).toEqual(10);

    game.endTurn(2, EndingType.Miss);
    expect(game.players[1].score).toEqual(3);

    game.endTurn(1, EndingType.NewRack);
    game.endTurn(10, EndingType.Foul);
    expect(game.players[0].score).toEqual(15);

    game.endTurn(2, EndingType.Miss);
    expect(game.players[1].score).toEqual(11);

    game.endTurn(2, EndingType.Miss);
    expect(game.players[0].score).toEqual(15);

    game.endTurn(1, EndingType.NewRack);
    game.endTurn(10, EndingType.Miss);
    expect(game.players[1].score).toEqual(17);

    game.endTurn(8, EndingType.Miss);
    expect(game.players[0].score).toEqual(17);

    game.endTurn(2, EndingType.Miss);
    expect(game.players[1].score).toEqual(23);

    game.endTurn(1, EndingType.NewRack);
    game.endTurn(10, EndingType.Miss);
    expect(game.players[0].score).toEqual(23);

    game.endTurn(8, EndingType.Miss);
    expect(game.players[1].score).toEqual(25);

    expect(game.hasWinner).toBeTruthy();
    expect(game.winner).toBe(game.players[1]);
  }));

  it('merges adjacent turns for the same player', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(1, EndingType.NewRack);
    game.endTurn(15, EndingType.Miss);

    expect(game.turns.length).toEqual(1);
    expect(game.players[0].turns.length).toEqual(1);
  }));

  it('tracks successful safeties', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    pending('what is a successful safety?');
  }));

  it('tracks successful safeties after continuation', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    pending();
  }));

  it('tracks errors??', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    pending('what is an error?');
  }));

  it('tracks other stats', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    pending('high-run, total-fouls, total-safeties, finished-racks, etc.');
  }));

});
