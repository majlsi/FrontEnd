import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from "@angular/core";
import { NgbNav, NgbNavChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { ApprovalTab } from "../../../../core/models/enums/tabs-approval";
import { TranslationService } from "../../../../core/services/translation.service";
import { ActivatedRoute, Router } from "@angular/router";
import { forkJoin, Observable } from 'rxjs';
import { PreviousRouteService } from "../../../../core/services/previous.route.service";

@Component({
	selector: "m-approval-page",
	templateUrl: "./approval-page.component.html",
	changeDetection: ChangeDetectionStrategy.Default,
})
export class ApprovalPageComponent implements OnInit {
	
	activeIdString: string;
	addMode: boolean;

	@ViewChild(NgbNav) private tabset: NgbNav;

	isArabic: boolean = false;
	submitted: boolean = false;
	previousUrl: string;

	constructor(private route: ActivatedRoute, private router: Router, private _translationService: TranslationService
		, private previousRouteService: PreviousRouteService,) {}

	ngOnInit() {
		this.getLanguage();
		// this.getMeetingLookups();
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.addMode = false;
				this.previousUrl = this.previousRouteService.getPreviousUrl();
				if(this.previousUrl == '/approvals/add') {
					this.activeIdString = ApprovalTab.TAB2;
				}
			} else {
				this.addMode = true;
				this.activeIdString = ApprovalTab.TAB1;
			}
		})
	}

	changeTab(tabId) {
		switch (tabId) {
			case 'TAB1':
				this.activeIdString = ApprovalTab.TAB1;
				break;
			case 'TAB2':
				this.activeIdString = ApprovalTab.TAB2;
				break;
			case 'TAB3':
				this.activeIdString = ApprovalTab.TAB3;
				break;
			default:
				this.activeIdString = ApprovalTab.TAB1;
		}
	}

	beforeChange($event: NgbNavChangeEvent) {
		this.activeIdString = $event.nextId;
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}


}
