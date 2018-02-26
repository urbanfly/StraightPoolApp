import { Injectable } from '@angular/core';

@Injectable()
export class StraightPoolRulesService {

  newGame(): StraightPoolGame {
    return new StraightPoolGame();
  }

  constructor() { }

}

export class StraightPoolGame {
  winner: StraightPoolPlayer;
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
    return lastTurn == null
      || lastTurn.ending === EndingType.BreakingFoul;
  }

  get hasWinner(): boolean {
    return this.winner != null;
  }

  switchPlayers(): StraightPoolPlayer {
    const currentPlayerIndex = this.players.indexOf(this.currentPlayer);
    this.currentPlayer =  this.players[(currentPlayerIndex + 1) % this.players.length];
    return this.currentPlayer;
  }

  endTurn(ballsRemaining: number, ending: EndingType): StraightPoolTurn {
    if (ballsRemaining > this.ballsRemaining) {
      throw new Error('Cannot end a turn with more balls than when the turn started.');
    }
    if (ending === EndingType.NewRack && ballsRemaining > 1) {
      throw new Error('NewRack can only be used when there are zero or one balls left.');
    }

    const ballsMade = this.ballsRemaining - ballsRemaining;
    const lastTurn = this.getLastTurn();
    const continuation = (lastTurn != null && lastTurn.player === this.currentPlayer) ? lastTurn : null;
    const thisTurn = this.currentPlayer.getTurn(ending, ballsMade, continuation);

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
      case EndingType.ThreeConsecutiveFouls:
      case EndingType.NewRack:
        this.ballsRemaining = 15;
        break; // the turn doesn't swich for 3-consecutive fouls
    }

    this.winner = this.players.find(p => p.score >= this.pointLimit);

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

  constructor(public name?: string) {}

  getTurn(ending: EndingType, points: number, continuation: StraightPoolTurn): StraightPoolTurn {
    if (points > 0) {
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
  ThreeConsecutiveFouls = 'ThreeConsecutiveFouls'
}

export class StraightPoolTurn {
  successfulSafety: boolean;
  constructor(public player: StraightPoolPlayer, public ending: EndingType, public points: number) {}
}
