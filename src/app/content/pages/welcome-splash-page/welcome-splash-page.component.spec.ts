import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeSplashPageComponent } from './welcome-splash-page.component';

describe('WelcomeSplashPageComponent', () => {
  let component: WelcomeSplashPageComponent;
  let fixture: ComponentFixture<WelcomeSplashPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomeSplashPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeSplashPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
