import { EndingType } from './straight-pool-ending-type.enum';
import { StraightPoolTurn } from './straight-pool-turn';
import { StraightPoolPlayer } from './straight-pool-player';

export class StraightPoolPlayerStats {

    static errorEndings = [EndingType.BreakingFoul, EndingType.Foul, EndingType.ThreeConsecutiveFouls, EndingType.Miss];

    constructor(public player: StraightPoolPlayer, private playerIndex: number, public allTurns: StraightPoolTurn[]) {}

    get playerName(): string { return this.player.name; }

    get consecutiveFouls(): number {
      const ts = this.playerTurns;
      let fouls = 0;
      for (let i = ts.length - 1; i >= 0; i--) {
        if (ts[i].ending === EndingType.Foul) {
          fouls++;
          if (ts[i].ballsMade > 0) {
            break;
          }
        } else {
          break;
        }
      }

      return fouls;
    }

    get playerTurns(): StraightPoolTurn[] {
      return this.allTurns.filter(t => t.playerIndex === this.playerIndex);
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
      return new StraightPoolTurn(this.playerIndex, ending, ballsMade, points, continuation);
    }
  }
