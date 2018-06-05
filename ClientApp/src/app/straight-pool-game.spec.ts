import { StraightPoolGame } from './straight-pool-game';
import { EndingType } from './straight-pool-ending-type.enum';

describe('StraightPoolGame', () => {
  it('should create an instance', () => {
    expect(new StraightPoolGame()).toBeTruthy();
  });

  it('can switch players before a turn', () => {
    const game = new StraightPoolGame();
    expect(game.canSwitchPlayers).toBeTruthy();

    let newPlayer = game.switchPlayers();
    expect(game.currentPlayer).toBe(newPlayer);
    expect(game.currentPlayer).toBe(game.players[1]);

    newPlayer = game.switchPlayers();
    expect(game.currentPlayer).toBe(newPlayer);
    expect(game.currentPlayer).toBe(game.players[0]);
  });

  it('cannot switch players after any turn', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Miss, 15);
    expect(game.canSwitchPlayers).toBeFalsy();
  });

  it('can force rerack after a breaking foul', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.BreakingFoul, 15);
    expect(game.canForceRerack).toBeTruthy();
  });

  it('can record a turn', () => {
    const game = new StraightPoolGame();
    const turn = game.endTurn(EndingType.Miss, 15);

    expect(game.turns[0]).toBe(turn);

    expect(turn).not.toBeNull();
    expect(turn.ending).toEqual(EndingType.Miss);
    expect(turn.playerIndex).toEqual(0);
    expect(turn.points).toEqual(0);
  });

  [EndingType.Miss, EndingType.BreakingFoul, EndingType.Foul, EndingType.Safety, EndingType.ForceRerack].forEach(element => {
    it(`switches players after a ${element}`, () => {
      const game = new StraightPoolGame();
      const turn = game.endTurn(element, 15);
      expect(game.currentPlayer).toBe(game.players[1]);
    });
  });

  it('resets balls remaining on 3 consecutive fouls', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Foul); // p1
    game.endTurn(EndingType.Miss); // p2
    game.endTurn(EndingType.Foul); // p1
    game.endTurn(EndingType.Miss); // p2
    const turn = game.endTurn(EndingType.Foul); // p1

    expect(turn.ending).toEqual(EndingType.ThreeConsecutiveFouls);
    expect(game.ballsRemaining).toEqual(15);
  });

  it('resets balls remaining on new rack', () => {
    const game = new StraightPoolGame();
    const turn = game.endTurn(EndingType.NewRack, 1); // p1

    expect(game.ballsRemaining).toEqual(15);
  });

  [EndingType.ThreeConsecutiveFouls, EndingType.NewRack].forEach(element => {
    it(`does not switch players on ${element}`, () => {
      const game = new StraightPoolGame();

      game.endTurn(element);

      expect(game.currentPlayer).toEqual(game.players[0]);
    });
  });

  it('detects 3 consecutive fouls', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Foul); // p1
    game.endTurn(EndingType.Miss); // p2
    game.endTurn(EndingType.Foul); // p1
    game.endTurn(EndingType.Miss); // p2
    const turn = game.endTurn(EndingType.Foul); // p1

    expect(turn.ending).toEqual(EndingType.ThreeConsecutiveFouls);
  });

  it('does not count a foul with points as consecutive', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Miss, 15); // p2
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Miss, 15); // p2
    const turn = game.endTurn(EndingType.Foul, 14); // p1; got one point

    expect(turn.ending).toEqual(EndingType.Foul);
  });

  it('deducts 1 point for a foul', () => {
    const game = new StraightPoolGame();
    const turn = game.endTurn(EndingType.Foul, 15);

    expect(turn.points).toEqual(-1);
  });

  it('deducts 15 points for 3 consecutive fouls', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    const turn = game.endTurn(EndingType.Foul, 15); // p1

    expect(turn.points).toEqual(-16); // -1 for normal foul + -15 for 3-consecutive
  });

  it('deducts 2 point for a breaking foul', () => {
    const game = new StraightPoolGame();
    const turn = game.endTurn(EndingType.BreakingFoul, 15);

    expect(turn.points).toEqual(-2);
  });

  it('throws if attempt NewRack with >1 ball remaining', () => {
    const game = new StraightPoolGame();
    expect(() => game.endTurn(EndingType.NewRack, 15)).toThrow();
  });

  it('throws if turns ends with "extra" balls', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Miss, 10);
    expect(() => game.endTurn(EndingType.Miss, 11)).toThrow();
  });

  it('detects winning', () => {
    const game = new StraightPoolGame();
    game.pointLimit = 20;
    game.endTurn(EndingType.NewRack, 1); // p1; score=14
    game.endTurn(EndingType.NewRack, 1); // p1; score=28

    expect(game.winner).toBe(game.players[0]);
    expect(game.hasWinner).toBeTruthy();
  });

  it('plays an example game', () => {
    const game = new StraightPoolGame();
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
  });

  it('merges adjacent turns for the same player', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.NewRack, 1); // +14
    game.endTurn(EndingType.NewRack, 1); // +14
    game.endTurn(EndingType.Miss, 13);   // +2

    expect(game.turns.length).toEqual(1);
    expect(game.getPlayerStats(0).playerTurns.length).toEqual(1);
    expect(game.getPlayerStats(0).score).toEqual(30);
    expect(game.getPlayerStats(0).playerTurns[0].ending).toEqual(EndingType.Miss);
  });

  it('detects successful safeties', () => {
    const game = new StraightPoolGame();
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
  });


  it('uses opening-break rules after three consecutive fouls', () => {
    const game = new StraightPoolGame();
    expect(game.isOpeningBreak).toBeTruthy();
    game.endTurn(EndingType.Foul); // p1
    expect(game.isOpeningBreak).toBeFalsy();
    game.endTurn(EndingType.Miss); // p2
    game.endTurn(EndingType.Foul); // p1
    game.endTurn(EndingType.Miss); // p2
    game.endTurn(EndingType.Foul); // p1
    expect(game.isOpeningBreak).toBeTruthy();
  });

  it('throws when ForceRerack is used with points', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.BreakingFoul); // p1
    expect(() => game.endTurn(EndingType.ForceRerack, 10)).toThrow();
  });

  it('requires NewRack ending when 1 ball remaining', () => {
    const game = new StraightPoolGame();
    expect(() => game.endTurn(EndingType.Miss, 1)).toThrow();
  });

  it('uses opening break rules after forced re-rack', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.BreakingFoul);
    game.endTurn(EndingType.ForceRerack);
    expect(game.isOpeningBreak).toBeTruthy();
  });

  it('treats safety followed by 0-point foul as successful', () => {
    const game = new StraightPoolGame();
    const turn = game.endTurn(EndingType.Safety);
    game.endTurn(EndingType.Foul);
    expect(turn.successfulSafety).toBeTruthy();
  });

  it('requires no balls made on a BreakingFoul', () => {
    const game = new StraightPoolGame();
    expect(() => game.endTurn(EndingType.BreakingFoul, 14)).toThrow();
  });

  it('can undo last turn', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Foul, 5);
    expect(game.turns.length).toEqual(1);

    game.undo();
    expect(game.turns.length).toEqual(0);
  });

  it('restores game state', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Foul, 5);
    expect(game.ballsRemaining).toEqual(5);

    game.undo();
    expect(game.ballsRemaining).toEqual(15);
  });

  it('can undo multiple turns', () => {
    const game = new StraightPoolGame();

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
  });

  it('can undo finish rack', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Miss, 5);
    game.endTurn(EndingType.NewRack, 1);
    game.undo();
    expect(game.ballsRemaining).toEqual(5);
  });

  it('undo does not throw', () => {
    const game = new StraightPoolGame();
    game.undo();
  });

  it('knows whether it can undo', () => {
    const game = new StraightPoolGame();
    expect(game.canUndo).toBeFalsy();

    game.endTurn(EndingType.Miss);
    expect(game.canUndo).toBeTruthy();

    game.undo();
    expect(game.canUndo).toBeFalsy();
  });
});
