import {
	Component,
	OnInit,
	AfterViewInit,
	ViewChild
} from '@angular/core';

import { MatStepper } from '@angular/material/stepper';

@Component({
	selector: 'm-welcome-splash',
	templateUrl: './welcome-splash.component.html',
	styleUrls: ['./welcome-splash.component.scss'],
})
export class WelcomeSplashComponent implements OnInit, AfterViewInit {
	// Only required when not passing the id in methods
	@ViewChild('stepper') myStepper: MatStepper;
	totalStepsCount: number;

	isCompleted;

	constructor() { }

	ngOnInit() { }
	// Event fired after view is initialized
	ngAfterViewInit() {
		this.totalStepsCount = this.myStepper._steps.length;
	}

	goForward() {
		const nextStepIndex = this.myStepper.selectedIndex + 1;
		if (nextStepIndex > 3) {
			//   this.isCreated = true;
			//   this.helpBarKeys(3);
			//   this.myStepper.selected.completed = true;
			//   this.myStepper.selected.editable = false;
			this.myStepper.next();
		} else {
			// this.myStepper.selected.completed = true;
			// this.myStepper.selected.editable = false;
			this.myStepper.next();
		}
	}


}
