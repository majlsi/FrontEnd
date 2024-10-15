import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
@Component({
    selector: 'm-proposal-list-page',
    templateUrl: './proposal-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})

export class ProposalListPageComponent implements OnInit {

	isParticipant: boolean = true;
	constructor() { }

	/** LOAD DATA */
	ngOnInit() {
	}


}
