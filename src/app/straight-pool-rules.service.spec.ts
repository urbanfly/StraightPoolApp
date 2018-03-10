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
    expect(game.currentPlayer).toBe(newPlayer);
    expect(game.currentPlayer).toBe(game.players[1]);

    newPlayer = game.switchPlayers();
    expect(game.currentPlayer).toBe(newPlayer);
    expect(game.currentPlayer).toBe(game.players[0]);
  }));

  it('cannot switch players after any turn', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Miss, 15);
    expect(game.canSwitchPlayers).toBeFalsy();
  }));

  it('can force rerack after a breaking foul', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.BreakingFoul, 15);
    expect(game.canForceRerack).toBeTruthy();
  }));

  it('can record a turn', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    const turn = game.endTurn(EndingType.Miss, 15);

    expect(game.turns[0]).toBe(turn);

    expect(turn).not.toBeNull();
    expect(turn.ending).toEqual(EndingType.Miss);
    expect(turn.player).toBe(game.players[0]);
    expect(turn.points).toEqual(0);
  }));

  [EndingType.Miss, EndingType.BreakingFoul, EndingType.Foul, EndingType.Safety, EndingType.ForceRerack].forEach(element => {
    it(`switches players after a ${element}`, inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
      const game = service.newGame();
      const turn = game.endTurn(element, 15);
      expect(game.currentPlayer).toBe(game.players[1]);
    }));
  });

  it('resets balls remaining on 3 consecutive fouls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 14); // p2
    game.endTurn(EndingType.Foul, 14); // p1
    game.endTurn(EndingType.Foul, 13); // p2
    const turn = game.endTurn(EndingType.Foul, 13); // p1

    expect(turn.ending).toEqual(EndingType.ThreeConsecutiveFouls);
    expect(game.ballsRemaining).toEqual(15);
  }));

  it('resets balls remaining on new rack', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    const turn = game.endTurn(EndingType.NewRack, 1); // p1

    expect(game.ballsRemaining).toEqual(15);
  }));

  [EndingType.ThreeConsecutiveFouls, EndingType.NewRack].forEach(element => {
    it(`does not switch players on ${element}`, inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
      const game = service.newGame();

      game.endTurn(element);

      expect(game.currentPlayer).toEqual(game.players[0]);
    }));
  });

  it('detects 3 consecutive fouls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    const turn = game.endTurn(EndingType.Foul, 15); // p1

    expect(turn.ending).toEqual(EndingType.ThreeConsecutiveFouls);
  }));

  it('does not count a foul with points as consecutive', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    const turn = game.endTurn(EndingType.Foul, 14); // p1; got one point

    expect(turn.ending).toEqual(EndingType.Foul);
  }));

  it('deducts 1 point for a foul', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    const turn = game.endTurn(EndingType.Foul, 15);

    expect(turn.points).toEqual(-1);
  }));

  it('deducts 15 points for 3 consecutive fouls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    const turn = game.endTurn(EndingType.Foul, 15); // p1

    expect(turn.points).toEqual(-16); // -1 for normal foul + -15 for 3-consecutive
  }));

  it('deducts 2 point for a breaking foul', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    const turn = game.endTurn(EndingType.BreakingFoul, 15);

    expect(turn.points).toEqual(-2);
  }));

  it('resets consecutive fouls after 3', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    const turn = game.endTurn(EndingType.Foul, 15); // p1

    expect(game.players[0].consecutiveFouls).toEqual(0);
  }));

  it('throws if attempt NewRack with >1 ball remaining', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(() => game.endTurn(EndingType.NewRack, 15)).toThrow();
  }));

  it('throws if turns ends with "extra" balls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Miss, 10);
    expect(() => game.endTurn(EndingType.Miss, 11)).toThrow();
  }));

  it('detects winning', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.pointLimit = 20;
    game.endTurn(EndingType.NewRack, 1); // p1; score=14
    game.endTurn(EndingType.NewRack, 1); // p1; score=28

    expect(game.winner).toBe(game.players[0]);
    expect(game.hasWinner).toBeTruthy();
  }));

  it('plays an example game', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.pointLimit = 25;

    game.endTurn(EndingType.Miss, 5);
    expect(game.players[0].score).toEqual(10);

    game.endTurn(EndingType.Miss, 2);
    expect(game.players[1].score).toEqual(3);

    game.endTurn(EndingType.NewRack, 1);
    game.endTurn(EndingType.Foul, 10);
    expect(game.players[0].score).toEqual(15);

    game.endTurn(EndingType.Miss, 2);
    expect(game.players[1].score).toEqual(11);

    game.endTurn(EndingType.Miss, 2);
    expect(game.players[0].score).toEqual(15);

    game.endTurn(EndingType.NewRack, 1);
    game.endTurn(EndingType.Miss, 10);
    expect(game.players[1].score).toEqual(17);

    game.endTurn(EndingType.Miss, 8);
    expect(game.players[0].score).toEqual(17);

    game.endTurn(EndingType.Miss, 2);
    expect(game.players[1].score).toEqual(23);

    game.endTurn(EndingType.NewRack, 1);
    game.endTurn(EndingType.Miss, 10);
    expect(game.players[0].score).toEqual(23);

    game.endTurn(EndingType.Miss, 8);
    expect(game.players[1].score).toEqual(25);

    expect(game.hasWinner).toBeTruthy();
    expect(game.winner).toBe(game.players[1]);
  }));

  it('merges adjacent turns for the same player', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.NewRack, 1); // +14
    game.endTurn(EndingType.NewRack, 1); // +14
    game.endTurn(EndingType.Miss, 13);   // +2

    expect(game.turns.length).toEqual(1);
    expect(game.players[0].turns.length).toEqual(1);
    expect(game.players[0].score).toEqual(30);
    expect(game.players[0].turns[0].ending).toEqual(EndingType.Miss);
  }));

  it('detects successful safeties', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    // a successful safety is when the opponent earns no points on the next turn
    let turnP1 = game.endTurn(EndingType.Safety, 15);
    let turnP2 = game.endTurn(EndingType.Safety, 15);

    expect(turnP1.successfulSafety)
      .toBeTruthy('Expected previous safety by player 1 to be successful');

    turnP1 = game.endTurn(EndingType.Safety, 15);
    expect(turnP2.successfulSafety)
      .toBeTruthy('Expected previous safety by player 2 to be successful');

    turnP2 = game.endTurn(EndingType.Safety, 14);
    expect(turnP1.successfulSafety)
      .toBeFalsy('Expected previous safety by player 1 to NOT be successful');

    turnP1 = game.endTurn(EndingType.Miss);
    expect(turnP1.successfulSafety)
      .toBeUndefined();
  }));

  it('tracks high run', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Miss, 14);
    expect(game.players[0].highRun).toEqual(1);

    game.endTurn(EndingType.Miss, 14);

    game.endTurn(EndingType.Miss, 10);
    expect(game.players[0].highRun).toEqual(4);

    game.endTurn(EndingType.Miss, 10);

    game.endTurn(EndingType.NewRack, 1);
    expect(game.players[0].highRun).toEqual(9);
    game.endTurn(EndingType.NewRack, 1);
    expect(game.players[0].highRun).toEqual(23);
  }));

  it('tracks total fouls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.BreakingFoul);
    expect(game.players[0].totalFouls).toEqual(1);

    game.endTurn(EndingType.ForceRerack);

    game.endTurn(EndingType.Foul);
    expect(game.players[0].totalFouls).toEqual(2);

    game.endTurn(EndingType.Foul);
    expect(game.players[1].totalFouls).toEqual(1);

    game.endTurn(EndingType.Foul);
    expect(game.players[0].totalFouls).toEqual(3);

    game.endTurn(EndingType.Foul);
    expect(game.players[1].totalFouls).toEqual(2);
  }));

  it('tracks total safeties', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Safety);
    expect(game.players[0].totalSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.players[1].totalSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.players[0].totalSafeties).toEqual(2);

    game.endTurn(EndingType.Safety);
    expect(game.players[1].totalSafeties).toEqual(2);
  }));

  it('tracks total successful safeties', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Safety);
    expect(game.players[0].totalSuccessfulSafeties).toEqual(0); // because we don't know yet

    game.endTurn(EndingType.Safety);
    expect(game.players[0].totalSuccessfulSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.players[1].totalSuccessfulSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.players[0].totalSuccessfulSafeties).toEqual(2);
  }));

  it('tracks finished racks', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.NewRack); // still player1's turn
    expect(game.players[0].totalFinishedRacks).toEqual(1);
    game.endTurn(EndingType.NewRack);
    expect(game.players[0].totalFinishedRacks).toEqual(2);
    game.endTurn(EndingType.NewRack);
    expect(game.players[0].totalFinishedRacks).toEqual(3);
    game.endTurn(EndingType.Miss);
    expect(game.players[0].totalFinishedRacks).toEqual(3);
  }));

  it('counts errors', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    // an error is any breaking foul, regular foul, miss, or unsuccessful safety
    game.endTurn(EndingType.BreakingFoul);
    expect(game.players[0].totalErrors).toEqual(1);

    game.endTurn(EndingType.Miss); // player2

    game.endTurn(EndingType.Foul);
    expect(game.players[0].totalErrors).toEqual(2);

    game.endTurn(EndingType.Miss); // player2

    game.endTurn(EndingType.Miss);
    expect(game.players[0].totalErrors).toEqual(3);

    game.endTurn(EndingType.Miss); // player2

    game.endTurn(EndingType.Foul);
    expect(game.players[0].totalErrors).toEqual(4);

    game.endTurn(EndingType.Miss); // player2

    game.endTurn(EndingType.Foul);
    expect(game.players[0].totalErrors).toEqual(5);

    game.endTurn(EndingType.Miss); // player2

    let turn = game.endTurn(EndingType.Foul);
    expect(turn.ending).toEqual(EndingType.ThreeConsecutiveFouls);
    expect(game.players[0].totalErrors).toEqual(6);

    expect(game.currentPlayer).toBe(game.players[0]);

    turn = game.endTurn(EndingType.Safety);
    expect(turn.successfulSafety).toBeUndefined();
    expect(game.players[0].totalErrors).toEqual(6);

    game.endTurn(EndingType.Safety, 10); // player2
    expect(game.players[0].totalErrors).toEqual(7);
  }));

  it('uses opening-break rules after three consecutive fouls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(game.isOpeningBreak).toBeTruthy();
    game.endTurn(EndingType.Foul); // p1
    expect(game.isOpeningBreak).toBeFalsy();
    game.endTurn(EndingType.Miss); // p2
    game.endTurn(EndingType.Foul); // p1
    game.endTurn(EndingType.Miss); // p2
    game.endTurn(EndingType.Foul); // p1
    expect(game.isOpeningBreak).toBeTruthy();
  }));

  it('resets consecutive fouls after non-foul', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    game.endTurn(EndingType.Miss, 15); // p1

    expect(game.players[0].consecutiveFouls).toEqual(0);
  }));

  it('throws when ForceRerack is used with points', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.BreakingFoul); // p1
    expect(() => game.endTurn(EndingType.ForceRerack, 10)).toThrow();
  }));

  it('does not count a BreakingFoul as "consecutive"', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.BreakingFoul); // p1
    expect(game.players[0].consecutiveFouls).toEqual(0);
  }));

  it('requires NewRack ending when 1 ball remaining', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(() => game.endTurn(EndingType.Miss, 1)).toThrow();
  }));

  it('uses opening break rules after forced re-rack', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.BreakingFoul);
    game.endTurn(EndingType.ForceRerack);
    expect(game.isOpeningBreak).toBeTruthy();
  }));

  // possible to have breaking foul with balls made?
  //   - make a ball, but "no rail"
  //   - make 1 ball, no other object ball contacts a rail

  // foul after a safety considered successful

  // how to count high run ending in a foul?
});
