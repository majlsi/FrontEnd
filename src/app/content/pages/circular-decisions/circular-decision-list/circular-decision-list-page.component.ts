import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { Committee } from '../../../../core/models/committee';
import { FilterObject } from '../../../../core/models/filter-object';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DecisionType } from '../../../../core/models/decision-type';
import { TranslationService } from '../../../../core/services/translation.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { ActivatedRoute } from '@angular/router';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { Right } from '../../../../core/models/enums/rights';
import { CircularDecisionTabs } from '../../../../core/models/enums/circular-decision-tabs';
import { DecisionResultStatuses } from '../../../../core/models/decision-result-statuses';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { VideoGuideService } from '../../../../core/services/video-guide/video-guide.service';
@Component({
	selector: 'm-circular-decision-list-page',
	templateUrl: './circular-decision-list-page.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class CircularDecisionListPageComponent implements OnInit, AfterViewInit {

	activeIdString: string = CircularDecisionTabs.allCircularDecisions;
	committees: Array<Committee> = [];
	isCollapsed: boolean = false;
	committeeBindLabel: string = "committee_name_ar";
	decisionTypeBindLabel: string = 'decision_type_name_ar';
	filterObject = new FilterObject();
	isArabic: boolean;
	loadingSubject = new BehaviorSubject<boolean>(false);
	dataSourceLength: boolean = false;
	paginatorTotal$: Observable<number>;
	decisionTypes: Array<DecisionType> = [];
	addFlag: boolean = false;
	vote_schedule_from: any;
	vote_schedule_to: any;
	decisionResultStatuses: Array<DecisionResultStatuses> = [];
	decisionResultStatusBindLabel: string = 'vote_result_status_name_ar';

	filterSubject = new Subject<boolean>();


	constructor(private _translationService: TranslationService,
		private _crudService: CrudService,
		private _roleService: RoleService,
		private route: ActivatedRoute,
		private videoGuideService: VideoGuideService,
		private committeeService: CommitteeService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.getCommittees();
		this.checkButtonAccess();
		this.getLanguage();
		this.getDecisionTypes();
		this.getDecicionResultStatuses()
		this.filterObject.SearchObject = {};
		this.route.queryParams.subscribe((queryParams) => {
			if (queryParams.activeTab) {
				this.activeIdString = queryParams.activeTab;
			}
			console.log(this.activeIdString)
		});
		this.getList();
	}

	ngAfterViewInit(): void {
		this.checkTutorialGuide();
	}

	getCommittees() {
		this.committeeService.getOrganizationCommittees<Committee>().subscribe(res => {
			this.committees = res;
		}, error => {
		});
	}

	getDecicionResultStatuses() {
		this._crudService.getList<DecisionResultStatuses>('admin/decision-result-statuses').subscribe(res => {
			this.decisionResultStatuses = res;
		});
	}

	checkButtonAccess() {
		this.checkAddFlag();
	}

	checkAddFlag() {
		this._roleService.canAccess(Right.ADD_CIRCULAR_DECISION).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		this.committeeBindLabel = this.isArabic ? 'committee_name_ar' : 'committee_name_en';
		this.decisionTypeBindLabel = this.isArabic ? 'decision_type_name_ar' : 'decision_type_name_en';
		this.decisionResultStatusBindLabel = this.isArabic ? 'vote_result_status_name_ar' : 'vote_result_status_name_en';
	}

	getDecisionTypes() {
		this._crudService.getList<DecisionType>('admin/decision-types').subscribe(res => {
			this.decisionTypes = res;
		}, error => {
		});
	}

	getList() {
	this.setDateModel();

		this.filterSubject.next(true);
	}
	setDateModel() {
        if (this.vote_schedule_from != null) {
            if (this.vote_schedule_from.year != null) {
				this.filterObject.SearchObject.vote_schedule_from =
				this.vote_schedule_from.year + '-' + this.vote_schedule_from.month + '-' + this.vote_schedule_from.day;
            }

		}
        if (this.vote_schedule_to != null) {
            if (this.vote_schedule_to.year != null) {
				this.filterObject.SearchObject.vote_schedule_to =
				this.vote_schedule_to.year + '-' + this.vote_schedule_to.month + '-' + this.vote_schedule_to.day;
            }
		}
	}
	beforeChange($event: NgbNavChangeEvent) {
		this.activeIdString = $event.nextId;
	}

	resetSearch() {
		this.filterObject.SearchObject = {};
		this.vote_schedule_to = null;
		this.vote_schedule_from = null;
		this.getList();
	};

	checkTutorialGuide(){
		let list = this.videoGuideService.getGuideStepsList();
		if(list && list.length > 0){
			this.videoGuideService.startGuide(list);
		}
	}
}
