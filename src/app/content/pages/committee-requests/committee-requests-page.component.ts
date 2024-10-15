import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'm-committee-requests-page',
  template: '<router-outlet></router-outlet>',
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeRequestsPageComponent implements OnInit {
  constructor() {}
  ngOnInit() {}
}
