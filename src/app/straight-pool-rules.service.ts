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
  currentPlayer: StraightPoolPlayer;
  ballsRemaining = 15;
  players: StraightPoolPlayer[];

  constructor(public pointLimit: number = 100) {
    this.players = [
      new StraightPoolPlayer('Player1'),
      new StraightPoolPlayer('Player2')
    ];
    this.currentPlayer = this.players[0];
  }

  get canSwitchPlayers(): boolean {
    const lastTurn = this.getLastTurn();
    return lastTurn == null;
  }

  get canForceRerack(): boolean {
    const lastTurn = this.getLastTurn();
    return lastTurn !== null
      && lastTurn.ending === EndingType.BreakingFoul;
  }

  get isOpeningBreak(): boolean {
    const lastTurn = this.getLastTurn();
    return lastTurn === null
      || lastTurn.ending === EndingType.ThreeConsecutiveFouls;
  }

  get winner(): StraightPoolPlayer {
    return this.players.find(p => p.score >= this.pointLimit);
  }

  get hasWinner(): boolean {
    return this.winner != null;
  }

  switchPlayers(): StraightPoolPlayer {
    const currentPlayerIndex = this.players.indexOf(this.currentPlayer);
    this.currentPlayer =  this.players[(currentPlayerIndex + 1) % this.players.length];
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
    } else if (ending === EndingType.ForceRerack && ballsRemaining !== this.ballsRemaining) {
      throw new Error('ForceRerack cannot be used if balls were made.');
    } else if (ballsRemaining > this.ballsRemaining) {
      throw new Error('Cannot end a turn with more balls than when the turn started.');
    }

    const ballsMade = this.ballsRemaining - ballsRemaining;
    const lastTurn = this.getLastTurn();
    const continuation = (lastTurn != null && lastTurn.ending === EndingType.NewRack) ? lastTurn : null;
    const thisTurn = this.currentPlayer.getTurn(ending, ballsMade, continuation);

    if (lastTurn && lastTurn.ending === EndingType.Safety) {
      lastTurn.successfulSafety = thisTurn.points === 0;
    }

    // only store this turn if it isn't a continuation of the last turn
    if (thisTurn !== continuation) {
      this.turns.push(thisTurn);
    }

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
        thisTurn.finishedRacks++;
        this.ballsRemaining = 15;
        break;
      case EndingType.ThreeConsecutiveFouls:
        this.ballsRemaining = 15;
        break; // the turn doesn't swich for 3-consecutive fouls
    }

    return thisTurn;
  }

  private getLastTurn(): StraightPoolTurn {
    if (this.turns.length === 0) {
      return null;
    }
    return this.turns[this.turns.length - 1];
  }
}

export class StraightPoolPlayer {
  score = 0;
  consecutiveFouls = 0;
  turns: StraightPoolTurn[] = [];

  get highRun(): number {
    return Math.max.apply(null, this.turns.map(t => t.points));
  }

  get totalFouls(): number {
    return this.turns.filter(t => t.ending === EndingType.Foul || t.ending === EndingType.BreakingFoul).length;
  }

  get totalMisses(): number {
    return this.turns.filter(t => t.ending === EndingType.Miss).length;
  }

  get totalSafeties(): number {
    return this.turns.filter(t => t.ending === EndingType.Safety).length;
  }

  get totalSuccessfulSafeties(): number {
    return this.turns.filter(t => t.successfulSafety).length;
  }

  get totalFinishedRacks(): number {
    return this.turns.reduce((prior, t) => prior + t.finishedRacks, 0);
  }

  private errorEndings = [EndingType.BreakingFoul, EndingType.Foul, EndingType.ThreeConsecutiveFouls, EndingType.Miss];
  get totalErrors(): number {
    return this.turns.filter(t => this.errorEndings.includes(t.ending)
      || t.successfulSafety === false).length;
  }

  constructor(public name?: string) {}

  getTurn(ending: EndingType, points: number, continuation: StraightPoolTurn): StraightPoolTurn {
    if (points > 0 || ending !== EndingType.Foul) {
      this.consecutiveFouls = 0;
    }

    switch (ending) {
      case EndingType.Foul:
        points--; // deduct a point for each foul
        this.consecutiveFouls++;

        if (this.consecutiveFouls === 3) {
          ending = EndingType.ThreeConsecutiveFouls;
          points -= 15;
          this.consecutiveFouls = 0;
        }
        break;
      case EndingType.BreakingFoul:
        points -= 2;
        break;
    }

    this.score += points;

    if (continuation) {
      continuation.ending = ending;
      continuation.points += points;
      return continuation;
    } else {
      const turn = new StraightPoolTurn(this, ending, points);
      this.turns.push(turn);
      return turn;
    }
  }
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

export class StraightPoolTurn {
  successfulSafety?: boolean;
  finishedRacks = 0;
  constructor(public player: StraightPoolPlayer, public ending: EndingType, public points: number) {}
}
