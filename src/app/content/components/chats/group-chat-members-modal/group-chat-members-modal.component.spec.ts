import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupChatMembersModalComponent } from './group-chat-members-modal.component';

describe('GroupChatMembersModalComponent', () => {
  let component: GroupChatMembersModalComponent;
  let fixture: ComponentFixture<GroupChatMembersModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupChatMembersModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupChatMembersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
