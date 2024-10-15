import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleChatWidgetComponent } from './collapsible-chat-widget.component';

describe('CollapsibleChatWidgetComponent', () => {
  let component: CollapsibleChatWidgetComponent;
  let fixture: ComponentFixture<CollapsibleChatWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollapsibleChatWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollapsibleChatWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
