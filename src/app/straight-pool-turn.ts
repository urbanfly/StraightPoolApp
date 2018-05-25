import { EndingType } from './straight-pool-ending-type.enum';

export class StraightPoolTurn {
    successfulSafety?: boolean;
    include15thBall = false;

    constructor(
      public playerIndex?: number,
      public ending?: EndingType,
      public ballsMade?: number,
      public points?: number,
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
