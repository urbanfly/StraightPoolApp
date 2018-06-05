import { StraightPoolTurn } from './straight-pool-turn';
import { EndingType } from './straight-pool-ending-type.enum';
import { StraightPoolPlayer } from './straight-pool-player';
import { StraightPoolPlayerStats } from './straight-pool-player-stats';
import * as uuidv4 from 'uuid/v4';

export class StraightPoolGame {
    id: string = uuidv4();
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
      return new StraightPoolPlayerStats(this.players[playerIndex], playerIndex, this.turns);
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
