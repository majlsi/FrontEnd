import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGuideFilesComponent } from './user-guide-files.component';

describe('UserGuideFilesComponent', () => {
  let component: UserGuideFilesComponent;
  let fixture: ComponentFixture<UserGuideFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserGuideFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGuideFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
