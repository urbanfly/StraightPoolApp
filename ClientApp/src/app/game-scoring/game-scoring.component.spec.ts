import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameScoringComponent } from './game-scoring.component';

describe('GameScoringComponent', () => {
  let component: GameScoringComponent;
  let fixture: ComponentFixture<GameScoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameScoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameScoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
