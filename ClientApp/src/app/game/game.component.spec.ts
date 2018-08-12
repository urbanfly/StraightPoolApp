import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { GameComponent } from './game.component';
import { FormsModule } from '@angular/forms';
import { PlayersComponent } from '../players/players.component';
import { EndingType } from '../straight-pool-ending-type.enum';
import { MaterialModule } from '../material/material.module';
import { StraightPoolGamesService, BASE_URL } from '../straight-pool-games.service';
import { LocalStraightPoolGamesService } from '../local-straight-pool-games.service';
import { RouterModule } from '../../../node_modules/@angular/router';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GameComponent, PlayersComponent
      ],
      imports: [
        FormsModule,
        MaterialModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: 'http://localhost/api/games' },
        { provide: BASE_URL, useValue: 'http://localhost/api/games' },
        { provide: StraightPoolGamesService, useClass: LocalStraightPoolGamesService }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('hides breaking foul when any balls are made', async(() => {
    component.ballsRemaining = 14;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const breakingFoulButton = el.querySelector('button#breakingFoul');
    expect(breakingFoulButton).toBeNull();
  }));

  it('hides switch players when any balls are made', async(() => {
    component.ballsRemaining = 14;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const breakingFoulButton = el.querySelector('button#switchPlayers');
    expect(breakingFoulButton).toBeNull();
  }));

  it('hides force re-rack when any balls are made', async(() => {
    component.game.endTurn(EndingType.BreakingFoul);
    component.ballsRemaining = 14;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const breakingFoulButton = el.querySelector('button#forceRerack');
    expect(breakingFoulButton).toBeNull();
  }));
});
