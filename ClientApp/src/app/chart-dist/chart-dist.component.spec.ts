import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartDistComponent } from './chart-dist.component';

describe('ChartDistComponent', () => {
  let component: ChartDistComponent;
  let fixture: ComponentFixture<ChartDistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartDistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartDistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
