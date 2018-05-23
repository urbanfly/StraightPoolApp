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
    expect(turn.playerName).toEqual(game.players[0].name);
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
    game.endTurn(EndingType.Foul); // p1
    game.endTurn(EndingType.Miss); // p2
    game.endTurn(EndingType.Foul); // p1
    game.endTurn(EndingType.Miss); // p2
    const turn = game.endTurn(EndingType.Foul); // p1

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
    game.endTurn(EndingType.Foul); // p1
    game.endTurn(EndingType.Miss); // p2
    game.endTurn(EndingType.Foul); // p1
    game.endTurn(EndingType.Miss); // p2
    const turn = game.endTurn(EndingType.Foul); // p1

    expect(turn.ending).toEqual(EndingType.ThreeConsecutiveFouls);
  }));

  it('does not count a foul with points as consecutive', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Miss, 15); // p2
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Miss, 15); // p2
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

    expect(game.getPlayerStats(0).consecutiveFouls).toEqual(0);
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
    expect(game.getPlayerStats(0).score).toEqual(10);

    game.endTurn(EndingType.Miss, 2);
    expect(game.getPlayerStats(1).score).toEqual(3);

    game.endTurn(EndingType.NewRack, 1);
    game.endTurn(EndingType.Foul, 10);
    expect(game.getPlayerStats(0).score).toEqual(15);

    game.endTurn(EndingType.Miss, 2);
    expect(game.getPlayerStats(1).score).toEqual(11);

    game.endTurn(EndingType.Miss, 2);
    expect(game.getPlayerStats(0).score).toEqual(15);

    game.endTurn(EndingType.NewRack, 1);
    game.endTurn(EndingType.Miss, 10);
    expect(game.getPlayerStats(1).score).toEqual(17);

    game.endTurn(EndingType.Miss, 8);
    expect(game.getPlayerStats(0).score).toEqual(17);

    game.endTurn(EndingType.Miss, 2);
    expect(game.getPlayerStats(1).score).toEqual(23);

    game.endTurn(EndingType.NewRack, 1);
    game.endTurn(EndingType.Miss, 10);
    expect(game.getPlayerStats(0).score).toEqual(23);

    game.endTurn(EndingType.Miss, 8);
    expect(game.getPlayerStats(1).score).toEqual(25);

    expect(game.hasWinner).toBeTruthy();
    expect(game.winner).toBe(game.players[1]);
  }));

  it('merges adjacent turns for the same player', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.NewRack, 1); // +14
    game.endTurn(EndingType.NewRack, 1); // +14
    game.endTurn(EndingType.Miss, 13);   // +2

    expect(game.turns.length).toEqual(1);
    expect(game.getPlayerStats(0).playerTurns.length).toEqual(1);
    expect(game.getPlayerStats(0).score).toEqual(30);
    expect(game.getPlayerStats(0).playerTurns[0].ending).toEqual(EndingType.Miss);
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
    expect(game.getPlayerStats(0).highRun).toEqual(1);

    game.endTurn(EndingType.Miss, 14);

    game.endTurn(EndingType.Miss, 10);
    expect(game.getPlayerStats(0).highRun).toEqual(4);

    game.endTurn(EndingType.Miss, 10);

    game.endTurn(EndingType.NewRack, 1);
    expect(game.getPlayerStats(0).highRun).toEqual(9);
    game.endTurn(EndingType.NewRack, 1);
    expect(game.getPlayerStats(0).highRun).toEqual(23);
  }));

  it('tracks total fouls', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.BreakingFoul);
    expect(game.getPlayerStats(0).totalFouls).toEqual(1);

    game.endTurn(EndingType.ForceRerack);

    game.endTurn(EndingType.Foul);
    expect(game.getPlayerStats(0).totalFouls).toEqual(2);

    game.endTurn(EndingType.Foul);
    expect(game.getPlayerStats(1).totalFouls).toEqual(1);

    game.endTurn(EndingType.Foul);
    expect(game.getPlayerStats(0).totalFouls).toEqual(3);

    game.endTurn(EndingType.Foul);
    expect(game.getPlayerStats(1).totalFouls).toEqual(2);
  }));

  it('tracks total safeties', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(0).totalSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(1).totalSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(0).totalSafeties).toEqual(2);

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(1).totalSafeties).toEqual(2);
  }));

  it('tracks total successful safeties', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(0).totalSuccessfulSafeties).toEqual(0); // because we don't know yet

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(0).totalSuccessfulSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(1).totalSuccessfulSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(0).totalSuccessfulSafeties).toEqual(2);
  }));

  it('tracks finished racks', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.NewRack); // still player1's turn
    expect(game.getPlayerStats(0).totalFinishedRacks).toEqual(1);
    game.endTurn(EndingType.NewRack);
    expect(game.getPlayerStats(0).totalFinishedRacks).toEqual(2);
    game.endTurn(EndingType.NewRack);
    expect(game.getPlayerStats(0).totalFinishedRacks).toEqual(3);
    game.endTurn(EndingType.Miss);
    expect(game.getPlayerStats(0).totalFinishedRacks).toEqual(3);
  }));

  it('starts with high run of zero', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(game.getPlayerStats(0).highRun).toEqual(0);
  }));

  it('tracks avg balls per turn', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(game.getPlayerStats(0).avgBallsPerTurn).toEqual(0);

    game.endTurn(EndingType.Foul, 5); // P1 = 10
    expect(game.getPlayerStats(0).avgBallsPerTurn).toEqual(10);

    game.endTurn(EndingType.Miss);

    game.endTurn(EndingType.Miss); // P1 = 5
    expect(game.getPlayerStats(0).avgBallsPerTurn).toEqual(5);
  }));

  it('counts errors', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    // an error is any breaking foul, regular foul, miss, or unsuccessful safety
    game.endTurn(EndingType.BreakingFoul);
    expect(game.getPlayerStats(0).totalErrors).toEqual(1);

    game.endTurn(EndingType.Miss); // player2

    game.endTurn(EndingType.Foul);
    expect(game.getPlayerStats(0).totalErrors).toEqual(2);

    game.endTurn(EndingType.Miss); // player2

    game.endTurn(EndingType.Miss);
    expect(game.getPlayerStats(0).totalErrors).toEqual(3);

    game.endTurn(EndingType.Miss); // player2

    game.endTurn(EndingType.Foul);
    expect(game.getPlayerStats(0).totalErrors).toEqual(4);

    game.endTurn(EndingType.Miss); // player2

    game.endTurn(EndingType.Foul);
    expect(game.getPlayerStats(0).totalErrors).toEqual(5);

    game.endTurn(EndingType.Miss); // player2

    let turn = game.endTurn(EndingType.Foul);
    expect(turn.ending).toEqual(EndingType.ThreeConsecutiveFouls);
    expect(game.getPlayerStats(0).totalErrors).toEqual(6);

    expect(game.currentPlayer).toBe(game.players[0]);

    turn = game.endTurn(EndingType.Safety);
    expect(turn.successfulSafety).toBeUndefined();
    expect(game.getPlayerStats(0).totalErrors).toEqual(6);

    game.endTurn(EndingType.Safety, 10); // player2
    expect(game.getPlayerStats(0).totalErrors).toEqual(7);
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

    expect(game.getPlayerStats(0).consecutiveFouls).toEqual(0);
  }));

  it('throws when ForceRerack is used with points', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.BreakingFoul); // p1
    expect(() => game.endTurn(EndingType.ForceRerack, 10)).toThrow();
  }));

  it('does not count a BreakingFoul as "consecutive"', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.BreakingFoul); // p1
    expect(game.getPlayerStats(0).consecutiveFouls).toEqual(0);
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

  it('treats safety followed by 0-point foul as successful', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    const turn = game.endTurn(EndingType.Safety);
    game.endTurn(EndingType.Foul);
    expect(turn.successfulSafety).toBeTruthy();
  }));

  it('requires no balls made on a BreakingFoul', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(() => game.endTurn(EndingType.BreakingFoul, 14)).toThrow();
  }));

  it('counts balls made instead of points for high-run', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    const turn = game.endTurn(EndingType.Foul, 5);
    expect(game.getPlayerStats(0).highRun).toEqual(10);
  }));

  it('tracks top 5 runs', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    let turn = game.endTurn(EndingType.Miss, 14); // player 1
    turn = game.endTurn(EndingType.Miss);     // player 2
    turn = game.endTurn(EndingType.Miss, 12);     // player 1
    turn = game.endTurn(EndingType.Miss);     // player 2
    turn = game.endTurn(EndingType.Miss, 9);     // player 1
    turn = game.endTurn(EndingType.Miss);     // player 2
    turn = game.endTurn(EndingType.Miss, 9);     // player 1
    turn = game.endTurn(EndingType.Miss);     // player 2
    turn = game.endTurn(EndingType.Miss, 9);     // player 1
    turn = game.endTurn(EndingType.Miss);     // player 2
    turn = game.endTurn(EndingType.Miss, 6);     // player 1
    turn = game.endTurn(EndingType.Miss);     // player 2
    expect(game.getPlayerStats(0).top5HighRuns).toEqual([3, 3, 2, 1, 0]);
  }));

  it('calculates std. deviation', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(game.getPlayerStats(0).standardDeviation).toEqual(0); // no turns yet

    game.endTurn(EndingType.Foul, 5);
    expect(game.getPlayerStats(0).standardDeviation).toEqual(0); // after 1 turn with 10 points

    game.endTurn(EndingType.Miss);
    game.endTurn(EndingType.Miss);
    expect(game.getPlayerStats(0).standardDeviation).toBeCloseTo(5);

    game.endTurn(EndingType.Miss);
    game.endTurn(EndingType.Miss);
    expect(game.getPlayerStats(0).standardDeviation).toBeCloseTo(4.714, 0.001);

    game.endTurn(EndingType.Miss);
    game.endTurn(EndingType.Miss, 4);
    expect(game.getPlayerStats(0).standardDeviation).toBeCloseTo(4.205, 0.001);
  }));

  it('can undo last turn', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Foul, 5);
    expect(game.turns.length).toEqual(1);

    game.undo();
    expect(game.turns.length).toEqual(0);
  }));

  it('restores game state', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Foul, 5);
    expect(game.ballsRemaining).toEqual(5);

    game.undo();
    expect(game.ballsRemaining).toEqual(15);
  }));

  it('can undo multiple turns', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();

    game.endTurn(EndingType.Foul, 5);

    game.endTurn(EndingType.Miss);
    game.endTurn(EndingType.Miss);

    game.endTurn(EndingType.Miss);
    game.endTurn(EndingType.Miss);

    game.endTurn(EndingType.Miss);
    game.endTurn(EndingType.Miss, 4);
    expect(game.getPlayerStats(0).standardDeviation).toBeCloseTo(4.205, 0.001);
    game.undo();
    game.undo();
    expect(game.getPlayerStats(0).standardDeviation).toBeCloseTo(4.714, 0.001);
    game.undo();
    game.undo();
    expect(game.getPlayerStats(0).standardDeviation).toBeCloseTo(5);
    game.undo();
    game.undo();
    expect(game.getPlayerStats(0).standardDeviation).toEqual(0); // after 1 turn with 10 points
    game.undo();
    expect(game.getPlayerStats(0).standardDeviation).toEqual(0); // no turns yet
  }));

  it('can undo finish rack', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.endTurn(EndingType.Miss, 5);
    game.endTurn(EndingType.NewRack, 1);
    game.undo();
    expect(game.ballsRemaining).toEqual(5);
  }));

  it('undo does not throw', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    game.undo();
  }));

  it('knows whether it can undo', inject([StraightPoolRulesService], (service: StraightPoolRulesService) => {
    const game = service.newGame();
    expect(game.canUndo).toBeFalsy();

    game.endTurn(EndingType.Miss);
    expect(game.canUndo).toBeTruthy();

    game.undo();
    expect(game.canUndo).toBeFalsy();
  }));
});
