import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { StraightPoolGame } from '../straight-pool-game';
import { EndingType } from '../straight-pool-ending-type.enum';
import { MatSnackBarRef, SimpleSnackBar, MatSnackBar } from '@angular/material';
import { StraightPoolTurn } from '../straight-pool-turn';

@Component({
  selector: 'app-game-scoring',
  templateUrl: './game-scoring.component.html',
  styleUrls: ['./game-scoring.component.css']
})
export class GameScoringComponent implements OnChanges {
  ballsRemaining: number;
  ballsToWin: number;

  @Input()
  game: StraightPoolGame;

  @Input()
  includeHandicap: boolean;

  @Output()
  gameChanged = new EventEmitter<StraightPoolTurn>();

  private newRackSnackBarRef: MatSnackBarRef<SimpleSnackBar>;

  constructor(private snackBar: MatSnackBar) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.game) {
      this.update();
    }
  }

  miss() { this.endTurn(EndingType.Miss); }
  foul() { this.endTurn(EndingType.Foul); }
  breakingFoul() { this.endTurn(EndingType.BreakingFoul); }
  safety() { this.endTurn(EndingType.Safety); }

  newRack(ballsRemaining: number) {
    const turn = this.endTurn(EndingType.NewRack, ballsRemaining);
    this.newRackSnackBarRef = this.snackBar.open('Nice job!', 'Include 15th ball', { duration: 5000 });
    this.newRackSnackBarRef.onAction().subscribe(() => {
      turn.include15thBall();
      this.update(turn);
    });
  }

  win(ballsRemaining: number) {
    this.endTurn(EndingType.Win, ballsRemaining);
  }

  undo() {
    const turn = this.game.undo();
    this.update(turn);
  }

  setBallsRemaining(ballsRemaining: number) {
    this.hideSnackBar();
    this.ballsRemaining = ballsRemaining;
  }

  private endTurn(ending: EndingType, ballsRemaining: number = this.ballsRemaining): StraightPoolTurn {
    const turn = this.game.endTurn(ending, ballsRemaining);
    this.update(turn);
    return turn;
  }

  private calcBallsToWin(): number {
    const stats = this.game.getPlayerStats(this.game.currentPlayerIndex);
    return this.game.pointLimit - stats.scoreWithHandicap;
  }

  update(turn?: StraightPoolTurn) {
    this.hideSnackBar();
    this.ballsRemaining = this.game.ballsRemaining;
    this.ballsToWin = this.calcBallsToWin();
    if (turn) {
      this.gameChanged.emit(turn);
    }
  }

  private hideSnackBar() {
    if (this.newRackSnackBarRef) {
      this.newRackSnackBarRef.dismiss();
      this.newRackSnackBarRef = null;
    }
  }
}
