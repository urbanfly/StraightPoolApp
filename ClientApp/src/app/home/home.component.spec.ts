import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { MaterialModule } from '../material/material.module';
import { ChartModule } from 'angular2-chartjs';
import { RouterTestingModule } from '@angular/router/testing';
import { StraightPoolGamesService } from '../straight-pool-games.service';
import { LocalStraightPoolGamesService } from '../local-straight-pool-games.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeComponent ],
      imports: [
        MaterialModule,
        ChartModule,
        RouterTestingModule.withRoutes(
          [{path: '', component: HomeComponent}]
        )
      ],
      providers: [
        { provide: StraightPoolGamesService, useClass: LocalStraightPoolGamesService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
