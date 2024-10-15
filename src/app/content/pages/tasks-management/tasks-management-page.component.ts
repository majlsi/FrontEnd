import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'm-tasks-management-page',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.Default
})
export class TasksManagementPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
