
import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';


@Component({
	selector: 'm-participant-page',
	templateUrl: './participant-page.component.html',
	changeDetection: ChangeDetectionStrategy.Default
 })
 export class ParticipantPageComponent implements OnInit {

	isParticipant: boolean = true;
	constructor() {

    }
	ngOnInit() {

	}



}
