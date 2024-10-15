import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionDetailsPageComponent } from './decision-details-page.component';

describe('DecisionDetailsPageComponent', () => {
  let component: DecisionDetailsPageComponent;
  let fixture: ComponentFixture<DecisionDetailsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DecisionDetailsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
