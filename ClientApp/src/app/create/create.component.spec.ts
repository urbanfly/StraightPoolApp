import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { APP_BASE_HREF } from '@angular/common';
import { CreateComponent } from './create.component';
import { MaterialModule } from '../material/material.module';
import { FormsModule } from '@angular/forms';
import { BASE_URL, StraightPoolGamesService } from '../straight-pool-games.service';
import { LocalStraightPoolGamesService } from '../local-straight-pool-games.service';
import { RouterModule } from '@angular/router';

describe('CreateComponent', () => {
  let component: CreateComponent;
  let fixture: ComponentFixture<CreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateComponent ],
      imports: [
        FormsModule,
        MaterialModule,
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: 'http://localhost/api/games' },
        { provide: BASE_URL, useValue: 'http://localhost/api/games' },
        { provide: StraightPoolGamesService, useClass: LocalStraightPoolGamesService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
