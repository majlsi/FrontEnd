import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
@Component({
    selector: 'm-user-list-page',
    templateUrl: './user-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})

export class UserListPageComponent implements OnInit {

	isParticipant: boolean = false;
	constructor() { }

	/** LOAD DATA */
	ngOnInit() {
	}


}
