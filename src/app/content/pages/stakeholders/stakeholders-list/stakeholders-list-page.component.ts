import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'm-stakeholders-list-page',
  templateUrl: './stakeholders-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class StakeholdersListPageComponent implements OnInit {
  isParticipant: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
