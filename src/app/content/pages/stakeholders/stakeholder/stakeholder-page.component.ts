import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'm-stakeholder-page',
  templateUrl: './stakeholder-page.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class StakeholderPageComponent implements OnInit {
  isParticipant: boolean = false;
  constructor() { }

  ngOnInit() {
  }

}
