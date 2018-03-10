import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameComponent } from './game.component';
import { FormsModule } from '@angular/forms';
import { StraightPoolRulesService, EndingType } from '../straight-pool-rules.service';
import { PlayerComponent } from '../player/player.component';
import { By } from '@angular/platform-browser';

fdescribe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GameComponent, PlayerComponent
      ],
      imports: [
        FormsModule
      ],
      providers: [StraightPoolRulesService],
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

  fit('hides breaking foul when any balls are made', async(() => {
    component.ballsRemaining = 14;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const breakingFoulButton = el.querySelector('button#breakingFoul');
    expect(breakingFoulButton).toBeNull();
  }));

  fit('hides switch players when any balls are made', async(() => {
    component.ballsRemaining = 14;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const breakingFoulButton = el.querySelector('button#switchPlayers');
    expect(breakingFoulButton).toBeNull();
  }));

  fit('hides force re-rack when any balls are made', async(() => {
    component.game.endTurn(EndingType.BreakingFoul);
    component.ballsRemaining = 14;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const breakingFoulButton = el.querySelector('button#forceRerack');
    expect(breakingFoulButton).toBeNull();
  }));
});
