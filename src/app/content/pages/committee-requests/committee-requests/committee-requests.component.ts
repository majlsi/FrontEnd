import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { CommitteeRequestsTab } from '../../../../core/models/enums/Committee-requests-tabs';
import { NgbNav, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'm-committee-requests',
  templateUrl: './committee-requests.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeRequestsComponent implements OnInit{
	activeIdString: string;
  @ViewChild(NgbNav) private tabset: NgbNav;
  constructor() {}
  ngOnInit() {}

  changeTab(tabId) {
		switch (tabId) {
			case 'TAB1':
				this.activeIdString = CommitteeRequestsTab.TAB1;
				break;
			case 'TAB2':
				this.activeIdString = CommitteeRequestsTab.TAB2;
				break;
			case 'TAB3':
				this.activeIdString = CommitteeRequestsTab.TAB3;
				break;
			case 'TAB4':
				this.activeIdString = CommitteeRequestsTab.TAB4;
				break;
			case 'TAB5':
				this.activeIdString = CommitteeRequestsTab.TAB5;
				break;
			case 'TAB6':
				this.activeIdString = CommitteeRequestsTab.TAB6;
				break;
			default:
				this.activeIdString = CommitteeRequestsTab.TAB1;
		} 
  }

  beforeChange($event: NgbNavChangeEvent) {
		this.activeIdString = $event.nextId;
	}
}
