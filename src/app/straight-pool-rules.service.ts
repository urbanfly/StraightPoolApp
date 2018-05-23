import { Injectable } from '@angular/core';

@Injectable()
export class StraightPoolRulesService {
  currentGame: StraightPoolGame;

  newGame(): StraightPoolGame {
    return new StraightPoolGame();
  }

  constructor() { }

}

export class StraightPoolGame {
  turns: StraightPoolTurn[] = [];
  players: StraightPoolPlayer[];
  currentPlayerIndex = 0;
  ballsRemaining = 15;

  constructor(public pointLimit: number = 100) {
    this.players = [
      new StraightPoolPlayer('Player1'),
      new StraightPoolPlayer('Player2')
    ];
  }

  get currentPlayer(): StraightPoolPlayer { return this.players[this.currentPlayerIndex]; }

  get canSwitchPlayers(): boolean {
    return this.getLastTurn() == null;
  }

  get canForceRerack(): boolean {
    const lastTurn = this.getLastTurn();
    return lastTurn !== null
      && lastTurn.ending === EndingType.BreakingFoul;
  }

  get canUndo(): boolean {
    return this.turns.length > 0;
  }

  get isOpeningBreak(): boolean {
    const lastTurn = this.getLastTurn();
    return lastTurn === null
    || lastTurn.ending === EndingType.ThreeConsecutiveFouls
    || lastTurn.ending === EndingType.ForceRerack;
  }

  get winner(): StraightPoolPlayer {
    return this.players.find((p, i) => this.getPlayerStats(i).score >= this.pointLimit);
  }

  get hasWinner(): boolean {
    return this.winner != null;
  }

  getPlayerStats(playerIndex: number): StraightPoolPlayerStats {
    return new StraightPoolPlayerStats(this.players[playerIndex], this.turns);
  }

  switchPlayers(): StraightPoolPlayer {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    return this.currentPlayer;
  }

  endTurn(ending: EndingType, ballsRemaining?: number): StraightPoolTurn {
    if (ballsRemaining == null) {
      if (ending === EndingType.NewRack) {
        ballsRemaining = 1; // assume one left in the most common case
      } else {
        ballsRemaining = this.ballsRemaining;
      }
    }
    if (ending === EndingType.NewRack && ballsRemaining > 1) {
      throw new Error('NewRack can only be used when there are zero or one balls left.');
    } else if (ending !== EndingType.NewRack && ballsRemaining <= 1) {
      throw new Error('NewRack is required when 0 or 1 balls are remaining.');
    } else if (ending === EndingType.ForceRerack && ballsRemaining !== this.ballsRemaining) {
      throw new Error('ForceRerack cannot be used if balls were made.');
    } else if (ending === EndingType.BreakingFoul && ballsRemaining !== 15) {
      throw new Error('BreakingFoul cannot be used if balls were made.');
    } else if (ballsRemaining > this.ballsRemaining) {
      throw new Error('Cannot end a turn with more balls than when the turn started.');
    }

    const ballsMade = this.ballsRemaining - ballsRemaining;
    const lastTurn = this.getLastTurn();
    const continuation = (lastTurn && lastTurn.ending === EndingType.NewRack) ? lastTurn : null;
    const thisTurn = this.getPlayerStats(this.currentPlayerIndex).getTurn(ending, ballsMade, continuation);
    thisTurn.playerIndex = this.currentPlayerIndex;
    thisTurn.include15thBall = ballsRemaining === 0;

    if (lastTurn && lastTurn.ending === EndingType.Safety) {
      lastTurn.successfulSafety = thisTurn.points <= 0;
    }

    if (continuation !== null) {
      this.turns.pop(); // take off the continuation
    }

    this.turns.push(thisTurn);

    switch (thisTurn.ending) {
      case EndingType.Miss:
      case EndingType.Foul:
      case EndingType.Safety:
      case EndingType.BreakingFoul:
        this.ballsRemaining = ballsRemaining;
        this.switchPlayers();
        break;
      case EndingType.ForceRerack:
        this.ballsRemaining = 15;
        this.switchPlayers();
        break;
      case EndingType.NewRack:
        this.ballsRemaining = 15;
        break;
      case EndingType.ThreeConsecutiveFouls:
        this.ballsRemaining = 15;
        break; // the turn doesn't swich for 3-consecutive fouls
    }

    return thisTurn;
  }

  undo(): StraightPoolTurn {
    const turn = this.turns.pop();
    if (turn === undefined) {
      return null;
    }

    this.currentPlayerIndex = turn.playerIndex;
    if (turn.ending === EndingType.NewRack) {
      this.ballsRemaining = turn.ballsMade + (turn.include15thBall ? 0 : 1);
    } else {
      this.ballsRemaining += turn.ballsMade;
    }

    if (turn.continuation) {
      this.turns.push(turn.continuation);
    }

    return turn;
  }

  private getLastTurn(): StraightPoolTurn {
    if (this.turns.length === 0) {
      return null;
    }
    return this.turns[this.turns.length - 1];
  }
}

export class StraightPoolPlayer {
  constructor(public name?: string) {}
}

export enum EndingType {
  Miss = 'Miss',
  Foul = 'Foul',
  Safety = 'Safety',
  NewRack = 'NewRack',
  BreakingFoul = 'BreakingFoul',
  ThreeConsecutiveFouls = 'ThreeConsecutiveFouls',
  ForceRerack = 'ForceRerack',
}

export class StraightPoolPlayerStats {

  static errorEndings = [EndingType.BreakingFoul, EndingType.Foul, EndingType.ThreeConsecutiveFouls, EndingType.Miss];

  constructor(public player: StraightPoolPlayer, public allTurns: StraightPoolTurn[]) {}

  get playerName(): string { return this.player.name; }

  get consecutiveFouls(): number {
    const ts = this.playerTurns;
    let fouls = 0;
    for (let i = ts.length - 1; i >= 0; i--) {
      if (ts[i].ending === EndingType.Foul && ts[i].ballsMade === 0) {
        fouls++;
      } else {
        break;
      }
    }

    return fouls;
  }

  get playerTurns(): StraightPoolTurn[] {
    return this.allTurns.filter(t => t.playerName === this.player.name);
  }

  get score(): number {
    return this.playerTurns.reduce((prior, t) => prior + t.totalPoints, 0);
  }

  get highRun(): number {
    return Math.max.apply(null, this.playerTurns.map(t => t.totalBallsMade).concat(0));
  }

  get totalFouls(): number {
    return this.playerTurns.filter(t => t.ending === EndingType.Foul || t.ending === EndingType.BreakingFoul).length;
  }

  get totalMisses(): number {
    return this.playerTurns.filter(t => t.ending === EndingType.Miss).length;
  }

  get totalSafeties(): number {
    return this.playerTurns.filter(t => t.ending === EndingType.Safety).length;
  }

  get totalSuccessfulSafeties(): number {
    return this.playerTurns.filter(t => t.successfulSafety).length;
  }

  get totalFinishedRacks(): number {
    return this.playerTurns.reduce((prior, t) => prior + t.finishedRacks, 0);
  }

  get totalErrors(): number {
    return this.playerTurns.filter(t => StraightPoolPlayerStats.errorEndings.includes(t.ending)
      || t.successfulSafety === false).length;
  }

  get avgBallsPerTurn(): number {
    const avg = this.playerTurns.reduce((p, c, i) => p + (c.totalBallsMade - p) / (i + 1), 0);
    return Number.parseFloat(avg.toFixed(2));
  }

  get top5HighRuns(): number[] {
    return this.playerTurns.map(turn => turn.totalBallsMade).sort((a, b) => a - b).reverse().slice(0, 5);
  }

  get standardDeviation(): number {
    function _avg(values: number[]): number {
      if (values.length === 0) {
        return 0;
      }

      const sum = values.reduce((p, c) => p + c, 0);
      return sum / values.length;
    }

    // sqrt(avg(points.map(p=>sqr(p-avg))))
    const ballsMade = this.playerTurns.map(turn => turn.totalBallsMade);
    const avg = _avg(ballsMade);
    const diffs = ballsMade.map(v => Math.pow(v - avg, 2));
    const diffAvg = _avg(diffs);
    return Number.parseFloat(Math.sqrt(diffAvg).toFixed(3));
  }

  getTurn(ending: EndingType, ballsMade: number, continuation: StraightPoolTurn): StraightPoolTurn {
    let points = ballsMade;

    switch (ending) {
      case EndingType.Foul:
        points--; // deduct a point for each foul

        if (this.consecutiveFouls === 2 && ballsMade === 0) {
          ending = EndingType.ThreeConsecutiveFouls;
          points -= 15;
        }
        break;
      case EndingType.BreakingFoul:
        points -= 2;
        break;
    }
    return new StraightPoolTurn(this.player.name, ending, ballsMade, points, continuation);
  }
}

export class StraightPoolTurn {
  successfulSafety?: boolean;
  playerIndex: number;
  include15thBall = false;

  constructor(
    public playerName: string,
    public ending: EndingType,
    public ballsMade: number,
    public points: number,
    public continuation?: StraightPoolTurn) {}

    get totalPoints(): number {
      return this.points + (this.continuation ? this.continuation.totalPoints : 0);
    }

    get totalBallsMade(): number {
      return this.ballsMade + (this.continuation ? this.continuation.totalBallsMade : 0);
    }

    get finishedRacks(): number {
      return (this.ending === EndingType.NewRack ? 1 : 0) + (this.continuation ? this.continuation.finishedRacks : 0);
    }
}
