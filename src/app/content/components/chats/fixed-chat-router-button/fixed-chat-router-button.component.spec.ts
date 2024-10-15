import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedChatRouterButtonComponent } from './fixed-chat-router-button.component';

describe('FixedChatRouterButtonComponent', () => {
  let component: FixedChatRouterButtonComponent;
  let fixture: ComponentFixture<FixedChatRouterButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedChatRouterButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedChatRouterButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
