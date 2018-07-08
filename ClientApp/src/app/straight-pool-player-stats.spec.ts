import { StraightPoolPlayerStats } from './straight-pool-player-stats';
import { StraightPoolPlayer } from './straight-pool-player';
import { StraightPoolTurn } from './straight-pool-turn';
import { StraightPoolGame } from './straight-pool-game';
import { EndingType } from './straight-pool-ending-type.enum';

// TODO: Track the type of foul (Scratch, Intentional, General)

describe('StraightPoolPlayerStats', () => {
  it('should create an instance', () => {
    expect(new StraightPoolPlayerStats(new StraightPoolPlayer(), 0, [])).toBeTruthy();
  });

  // TODO: remove use of SPG; test the stats directly
  it('tracks high run', () => {
    const stats = new StraightPoolPlayerStats(null, 0, [
      new StraightPoolTurn(0, EndingType.Miss, 1, 1),
      new StraightPoolTurn(0, EndingType.Miss, 2, 2),
      new StraightPoolTurn(0, EndingType.Miss, 3, 3),
      new StraightPoolTurn(0, EndingType.Miss, 4, 4),
      new StraightPoolTurn(0, EndingType.Miss, 5, 5)
    ]);

    expect(stats.highRun).toBe(5);
  });

  it('tracks high runs that span continuations', () => {
    const stats = new StraightPoolPlayerStats(null, 0, [
      new StraightPoolTurn(0, EndingType.Miss, 14, 14,
        new StraightPoolTurn(0, EndingType.NewRack, 9, 9)),
    ]);

    expect(stats.highRun).toBe(23);
  });

  it('tracks total fouls', () => {
    const stats = new StraightPoolPlayerStats(null, 0, [
      new StraightPoolTurn(0, EndingType.BreakingFoul),
      new StraightPoolTurn(1, EndingType.ForceRerack),
      new StraightPoolTurn(0, EndingType.Foul),
      new StraightPoolTurn(1, EndingType.Foul),
      new StraightPoolTurn(0, EndingType.Foul),
      new StraightPoolTurn(1, EndingType.Foul)
    ]);

    expect(stats.totalFouls).toBe(3);
  });

  it('tracks total safeties', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(0).totalSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(1).totalSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(0).totalSafeties).toEqual(2);

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(1).totalSafeties).toEqual(2);
  });

  it('tracks total successful safeties', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(0).totalSuccessfulSafeties).toEqual(0); // because we don't know yet

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(0).totalSuccessfulSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(1).totalSuccessfulSafeties).toEqual(1);

    game.endTurn(EndingType.Safety);
    expect(game.getPlayerStats(0).totalSuccessfulSafeties).toEqual(2);
  });

  it('tracks finished racks', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.NewRack); // still player1's turn
    expect(game.getPlayerStats(0).totalFinishedRacks).toEqual(1);
    game.endTurn(EndingType.NewRack);
    expect(game.getPlayerStats(0).totalFinishedRacks).toEqual(2);
    game.endTurn(EndingType.NewRack);
    expect(game.getPlayerStats(0).totalFinishedRacks).toEqual(3);
    game.endTurn(EndingType.Miss);
    expect(game.getPlayerStats(0).totalFinishedRacks).toEqual(3);
  });

  it('starts with high run of zero', () => {
    const game = new StraightPoolGame();
    expect(game.getPlayerStats(0).highRun).toEqual(0);
  });

  it('tracks avg balls per turn', () => {
    const game = new StraightPoolGame();
    expect(game.getPlayerStats(0).avgBallsPerTurn).toEqual(0);

    game.endTurn(EndingType.Foul, 5); // P1 = 10
    expect(game.getPlayerStats(0).avgBallsPerTurn).toEqual(10);

    game.endTurn(EndingType.Miss);

    game.endTurn(EndingType.Miss); // P1 = 5
    expect(game.getPlayerStats(0).avgBallsPerTurn).toEqual(5);
  });

  it('counts errors', () => {
    const game = new StraightPoolGame();
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
  });

  it('counts balls made instead of points for high-run', () => {
    const game = new StraightPoolGame();
    const turn = game.endTurn(EndingType.Foul, 5);
    expect(game.getPlayerStats(0).highRun).toEqual(10);
  });

  it('resets consecutive fouls after 3', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    const turn = game.endTurn(EndingType.Foul, 15); // p1

    expect(game.getPlayerStats(0).consecutiveFouls).toEqual(0);
  });

  it('resets consecutive fouls after non-foul', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    game.endTurn(EndingType.Foul, 15); // p1
    game.endTurn(EndingType.Foul, 15); // p2
    game.endTurn(EndingType.Miss, 15); // p1

    expect(game.getPlayerStats(0).consecutiveFouls).toEqual(0);
  });

  it('does not count a BreakingFoul as "consecutive"', () => {
    const game = new StraightPoolGame();
    game.endTurn(EndingType.BreakingFoul); // p1
    expect(game.getPlayerStats(0).consecutiveFouls).toEqual(0);
  });

  it('tracks top 5 runs', () => {
    const game = new StraightPoolGame();
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
  });

  it('calculates std. deviation', () => {
    const game = new StraightPoolGame();
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
  });
});
