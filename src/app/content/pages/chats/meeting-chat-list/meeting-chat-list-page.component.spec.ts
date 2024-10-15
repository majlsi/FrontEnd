import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingChatListPageComponent } from './meeting-chat-list-page.component';

describe('MeetingChatListComponent', () => {
  let component: MeetingChatListPageComponent;
  let fixture: ComponentFixture<MeetingChatListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeetingChatListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeetingChatListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
