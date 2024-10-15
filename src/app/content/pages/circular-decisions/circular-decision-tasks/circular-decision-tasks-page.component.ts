import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'm-circular-decision-tasks-page',
    templateUrl: './circular-decision-tasks-page.component.html',
    styleUrls: ['./circular-decision-tasks-page.component.scss']
})

export class CircularDecisionTasksPageComponent implements OnInit {
    
    activeTab: string;

    constructor(private route: ActivatedRoute,
        private router: Router) { }

	/** LOAD DATA */
	ngOnInit() {
        this.route.queryParams.subscribe((queryParams) => {
			if (queryParams.activeTab) {
				this.activeTab = queryParams.activeTab;
			}
		});
    }
    
    back() {
        this.router.navigate(["/circular-decisions"],{ queryParams: {activeTab: this.activeTab} });
    }
}
