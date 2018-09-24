import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartScoreComponent } from './chart-score.component';

describe('ChartScoreComponent', () => {
  let component: ChartScoreComponent;
  let fixture: ComponentFixture<ChartScoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartScoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
