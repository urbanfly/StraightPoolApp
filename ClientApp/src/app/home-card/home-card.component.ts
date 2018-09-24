import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StraightPoolGame } from '../straight-pool-game';
import * as Moment from 'moment';

@Component({
  selector: 'app-home-card',
  templateUrl: './home-card.component.html',
  styleUrls: ['./home-card.component.css'],
})
export class HomeCardComponent implements OnInit {
  @Input()
  game: StraightPoolGame;

  @Output()
  deleting = new EventEmitter<StraightPoolGame>();

  constructor() { }

  ngOnInit() {
  }

  deleteGame() {
    this.deleting.emit(this.game);
  }

  getGameMoment(): Moment.Moment {
    return Moment([2018, 7, 19, 23, 45]);
  }
}
