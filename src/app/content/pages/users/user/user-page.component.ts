
import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';


@Component({
	selector: 'm-user-page',
	templateUrl: './user-page.component.html',
	changeDetection: ChangeDetectionStrategy.Default
 })
 export class UserPageComponent implements OnInit {

	isParticipant: boolean = false;
	constructor() {

    }
	ngOnInit() {

	}



}
