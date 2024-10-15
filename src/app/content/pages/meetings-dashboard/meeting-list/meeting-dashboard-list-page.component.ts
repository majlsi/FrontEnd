import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {NgbNavChangeEvent} from '@ng-bootstrap/ng-bootstrap';
import { DashboardTabs } from '../../../../core/models/enums/dashboard-tabs';
// RXJS
import { tap, finalize } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';

// Services
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import {CommitteeService} from '../../../../core/services/committee/committee.service';

// Models
import { MeetingType } from '../../../../core/models/meeting-type';
import { FilterObject } from '../../../../core/models/filter-object';
import { PagedResult } from '../../../../core/models/paged-result';
import { Meeting } from '../../../../core/models/meeting';
import { MeetingStatus } from '../../../../core/models/meeting-status';
import { Committee } from '../../../../core/models/committee';

@Component({
    selector: 'm-meeting-dash-list-page',
    templateUrl: './meeting-dashboard-list-page.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})

export class MeetingDashboardListPageComponent implements OnInit {

    activeIdString: string;
	organizationCommittees: Array<Committee> = [];
	isCollapsed: boolean = false;
	currentDate = new Date();
	bindLabel: string = 'meeting_type_name_en';
	filterObject = new FilterObject();
	loadingSubject = new BehaviorSubject<boolean>(false);
	dataSourceLength: boolean = false;
	paginatorTotal$: Observable<number>;
	dataSource: Array<Meeting> = [];
	isArabic: boolean;
	bindMeetingStatusLabel: string = 'meeting_status_name_en';
	meetingStatuses: Array<MeetingStatus> = [];
	meeting_schedule_from_date ;
	meeting_schedule_to_date ;

	constructor(private _organizationService: OrganizationService,
		private _meetingService: MeetingService,
		private _translationService: TranslationService,
		private _crudService: CrudService,
		private committeeService: CommitteeService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.getOrganizationMeetingCommittees();
		this.getLanguage();
		this.getMeetingStatuses();
		this.activeIdString = DashboardTabs.CURRENTMEETINGS;
		this.filterObject.SearchObject = {};
		this.getList();
	}

    beforeChange($event: NgbNavChangeEvent) {
		this.activeIdString = $event.nextId;
		this.getList();
	}

	getOrganizationMeetingCommittees() {
		this.committeeService.getOrganizationCommittees<Committee>().subscribe(res => {
			this.organizationCommittees = res;
		}, error => {

		});
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = 1;
		this.filterObject.SortBy = 'id';
		this.filterObject.SortDirection = 'desc';
		this.dataSourceLength = false;
		this.setDateModel();
		if (this.activeIdString === DashboardTabs.CURRENTMEETINGS) {
			this.getCurrentMeetingStatuses();

		} else if (this.activeIdString === DashboardTabs.PREVIOUSMEETINGS) {
			this.getPreviousMeetingStatuses();
		}
		// else if (this.activeIdString === DashboardTabs.COMINGMEETINGS) {
		// 	this.getComingMeetingStatuses();
		// }
	}


	setDateModel() {
        if (this.meeting_schedule_from_date != null) {
            if (this.meeting_schedule_from_date.year != null) {
				this.filterObject.SearchObject.meeting_schedule_from =
				this.meeting_schedule_from_date.year + '-' + this.meeting_schedule_from_date.month + '-' + this.meeting_schedule_from_date.day;
            }

		}
        if (this.meeting_schedule_to_date != null) {
            if (this.meeting_schedule_to_date.year != null) {
				this.filterObject.SearchObject.meeting_schedule_to =
				this.meeting_schedule_to_date.year + '-' + this.meeting_schedule_to_date.month + '-' + this.meeting_schedule_to_date.day;
            }
		}
	}


	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.meeting_schedule_from_date = null;
		this.meeting_schedule_to_date = null;
		this.getList();
	};

	getLanguage() {
		this.isArabic =  this._translationService.isArabic();
		if (this.isArabic === true) {
			this.bindLabel = 'meeting_type_name_ar';
			this.bindMeetingStatusLabel = 'meeting_status_name_ar';
		}
	}


	getMeetingStatuses() {
		this._crudService.getList<MeetingStatus>('admin/meetings-statuses').subscribe(res => {
			this.meetingStatuses = res;
		}, error => {
		});
	}

	getCurrentMeetingStatuses() {
		this._meetingService.getCurrentMeetingsPaginatedList<PagedResult>(this.filterObject).
		subscribe(res => {
				this.loadingSubject.next(false);
		 		this.paginatorTotal$ = res.TotalRecords;
		 		this.dataSource = res.Results;
		 		if (this.dataSource.length === 0) {
		 			this.dataSourceLength = true;
		 		}
		 	},
		 	error => {
		 			this.loadingSubject.next(false);
			});
	}

	getPreviousMeetingStatuses() {
		this._meetingService.getPreviousMeetingsPaginatedList<PagedResult>(this.filterObject).
		subscribe(res => {
				this.loadingSubject.next(false);
		 		this.paginatorTotal$ = res.TotalRecords;
		 		this.dataSource = res.Results;
		 		if (this.dataSource.length === 0) {
		 			this.dataSourceLength = true;
		 		}
		 	},
		 	error => {
		 			this.loadingSubject.next(false);
			});
	}
	// getComingMeetingStatuses() {
	// 	this._meetingService.getComingMeetingsPaginatedList<PagedResult>(this.filterObject).
	// 	subscribe(res => {
	// 			this.loadingSubject.next(false);
	// 	 		this.paginatorTotal$ = res.TotalRecords;
	// 	 		this.dataSource = res.Results;
	// 	 		if (this.dataSource.length === 0) {
	// 	 			this.dataSourceLength = true;
	// 	 		}
	// 	 	},
	// 	 	error => {
	// 	 			this.loadingSubject.next(false);
	// 		});
	// }
}
