import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
@Component({
    selector: 'm-participant-list-page',
    templateUrl: './participant-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})

export class ParticipantListPageComponent implements OnInit {

	isParticipant: boolean = true;
	constructor() { }

	/** LOAD DATA */
	ngOnInit() {
	}


}
