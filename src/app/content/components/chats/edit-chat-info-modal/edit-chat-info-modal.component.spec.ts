import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChatInfoModalComponent } from './edit-chat-info-modal.component';

describe('EditChatInfoModalComponent', () => {
  let component: EditChatInfoModalComponent;
  let fixture: ComponentFixture<EditChatInfoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditChatInfoModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditChatInfoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
