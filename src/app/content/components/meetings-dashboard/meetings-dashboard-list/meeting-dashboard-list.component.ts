import {
	Component,
	OnInit,
	ChangeDetectionStrategy,
	Input,
	ViewChild,
} from "@angular/core";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";

// RXJS
import { tap, finalize } from "rxjs/operators";
import { merge, BehaviorSubject, Observable } from "rxjs";

// Models
import { FilterObject } from "../../../../core/models/filter-object";
import { Meeting } from "../../../../core/models/meeting";
import { PagedResult } from "../../../../core/models/paged-result";
import { MeetingType } from "../../../../core/models/meeting-type";
import { DashboardTabs } from "../../../../core/models/enums/dashboard-tabs";

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

// Services
import {
	LayoutUtilsService,
	MessageType,
} from "../../../../core/services/layout-utils.service";
import { environment } from "../../../../../environments/environment";
import { TranslationService } from "../../../../core/services/translation.service";
import { OrganizationService } from "../../../../core/services/organization/organization.service";
import { MeetingService } from "../../../../core/services/meeting/meeting.service";
import { RoleService } from "../../../../core/services/security/roles.service";
import { Right } from "../../../../core/models/enums/rights";
import { MeetingStatuses } from "../../../../core/models/enums/meeting-statuses";

@Component({
	selector: "m-meeting-dash-list",
	templateUrl: "./meeting-dashboard-list.component.html",
	changeDetection: ChangeDetectionStrategy.Default,
})
export class MeetingDashboardListComponent implements OnInit {
	@Input() dataSourceLength: boolean;
	@Input() dataSource: Array<Meeting>;

	meetingStatuses = MeetingStatuses;

	@Input() loadingSubject: BehaviorSubject<boolean>;
	loading$;

	// Paginator | Paginators count
	@Input() paginatorTotal$: Observable<number>;

	@Input() filterObject: FilterObject;

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@Input() meetingTypes: Array<MeetingType>;
	@Input() activeIdString: string;
	displayedColumns: Array<string>;
	pageSize = environment.pageSize;
	isArabic: boolean;
	viewFlag: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private _crudService: CrudService,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private _meetingService: MeetingService,
		private roleService: RoleService
	) {}

	/** LOAD DATA */
	ngOnInit() {
		this.getLanguage();
		this.checkViewMeetingAccess();
	}

	ngAfterViewInit(): void {
		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.getList();
				})
			)
			.subscribe();
			this.loading$ = this.loadingSubject.asObservable();
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic) {
			this.displayedColumns = [
				"committee_name_ar",
				"meeting_title_ar",
				"meeting_code",
				"meeting_venue_ar",
				"meeting_schedule_from",
				"meeting_status_name_ar"
			];
		} else {
			this.displayedColumns = [
				"committee_name_en",
				"meeting_title_en",
				"meeting_code",
				"meeting_venue_en",
				"meeting_schedule_from",
				"meeting_status_name_en"
			];
		}
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.SortDirection =
			this.sort.direction !== "" ? this.sort.direction : "DESC";
		this.dataSourceLength = false;
		if (this.activeIdString === DashboardTabs.CURRENTMEETINGS) {
			this.getCurrentMeetingStatuses();
		} else if (this.activeIdString === DashboardTabs.PREVIOUSMEETINGS) {
			this.getPreviousMeetingStatuses();
		}
		// else if (this.activeIdString === DashboardTabs.COMINGMEETINGS) {
		// 	this.getComingMeetingStatuses();
		// }
	}

	getCurrentMeetingStatuses() {
		this._meetingService
			.getCurrentMeetingsPaginatedList<PagedResult>(this.filterObject)
			.subscribe(
				(res) => {
					this.loadingSubject.next(false);
					this.paginatorTotal$ = res.TotalRecords;
					this.dataSource = res.Results;
					if (this.dataSource.length === 0) {
						this.dataSourceLength = true;
					}
				},
				(error) => {
					this.loadingSubject.next(false);
				}
			);
	}

	getPreviousMeetingStatuses() {
		this._meetingService
			.getPreviousMeetingsPaginatedList<PagedResult>(this.filterObject)
			.subscribe(
				(res) => {
					this.loadingSubject.next(false);
					this.paginatorTotal$ = res.TotalRecords;
					this.dataSource = res.Results;
					if (this.dataSource.length === 0) {
						this.dataSourceLength = true;
					}
				},
				(error) => {
					this.loadingSubject.next(false);
				}
			);
	}
	// getComingMeetingStatuses() {
	// 	this._meetingService.getComingMeetingsPaginatedList<PagedResult>(this.filterObject).
	// 		subscribe(res => {
	// 			this.loadingSubject.next(false);
	// 			this.paginatorTotal$ = res.TotalRecords;
	// 			this.dataSource = res.Results;
	// 			if (this.dataSource.length === 0) {
	// 				this.dataSourceLength = true;
	// 			}
	// 		},
	// 			error => {
	// 				this.loadingSubject.next(false);
	// 			});
	// }

	viewMeeting(meetingId: number) {
		this.router.navigate(["/view-meetings/", meetingId]);
	}

	checkViewMeetingAccess() {
		this.roleService.canAccess(Right.VIEWMEETING).subscribe(
			(res) => {
				if (res.canAccess === 1) {
					this.viewFlag = true;
				}
			},
			(error) => {}
		);
	}
}
