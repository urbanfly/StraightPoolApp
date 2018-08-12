import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MaterialModule } from './material/material.module';
import { RouterModule } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { of } from 'rxjs';
import { APP_BASE_HREF } from '@angular/common';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [
        MaterialModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '' },
        { provide: SwUpdate, useValue: { available: of({}) , activated: of({}) } },
      ],
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'Straight Pool'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app: AppComponent = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Straight Pool');
  }));

  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.children[0].nativeElement;
    expect(compiled.textContent).toContain('Straight Pool');
  }));
});
