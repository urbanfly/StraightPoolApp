import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { StraightPoolGamesService } from '../straight-pool-games.service';
import { StraightPoolGame } from '../straight-pool-game';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  games: Observable<StraightPoolGame[]>;

  @ViewChild('deleteConfirmation') deleteConfirmation: TemplateRef<any>;

  constructor(private gamesService: StraightPoolGamesService,
              private dialogService: MatDialog) { }

  ngOnInit() {
    this.updateGameList();
  }

  private updateGameList() {
    this.games = this.gamesService.listGames();
  }

  deleteGame(id: string) {
    this.dialogService.open(this.deleteConfirmation)
      .afterClosed()
      .subscribe(result => {
        if (result === 'delete') {
          this.gamesService
            .deleteGame(id)
            .toPromise()
            .then(() => this.updateGameList());
        }
      });
  }
}
