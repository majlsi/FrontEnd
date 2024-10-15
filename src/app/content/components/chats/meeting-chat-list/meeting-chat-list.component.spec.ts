import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingChatListComponent } from './meeting-chat-list.component';

describe('MeetingChatListComponent', () => {
  let component: MeetingChatListComponent;
  let fixture: ComponentFixture<MeetingChatListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingChatListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingChatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
