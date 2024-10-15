import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'm-dashboards-page',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.Default
})
export class DashboardsPageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
