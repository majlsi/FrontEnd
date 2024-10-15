import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// RXJS
import { tap, finalize } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';

// Models
import { FilterObject } from '../../../../core/models/filter-object';
import { Meeting } from '../../../../core/models/meeting';
import { PagedResult } from '../../../../core/models/paged-result';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

// Services
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { environment } from './../../../../../environments/environment';
import { TranslationService } from '../../../../core/services/translation.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
// Enums
import { MeetingStatuses } from '../../../../core/models/enums/meeting-statuses';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { Right } from '../../../../core/models/enums/rights';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StartMeetingComponent } from '../start-meeting/start-meeting.component';
import { UserService } from '../../../../core/services/security/users.service';
import { Organization } from '../../../../core/models/organization';
import { OnlineMeetingApps } from '../../../../core/models/enums/online-meeting-apps';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { Committee } from '../../../../core/models/committee';
import { VideoGuideService } from '../../../../core/services/video-guide/video-guide.service';
import { Tab } from '../../../../core/models/enums/tabs';

@Component({
	selector: 'm-meeting-list',
	templateUrl: './meeting-list.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class MeetingListComponent implements OnInit, AfterViewInit {

	activeIdString: string;
	isCollapsed: boolean = false;
	dataSourceLength: boolean = false;
	dataSource: Array<Meeting> = [];
	displayedColumns: string[];

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject = new FilterObject();
	meetingStatus = MeetingStatuses;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	isArabic: boolean;
	committees: Array<Committee> = [];
	bindLabel: string = 'committee_name_en';

	meeting_schedule_from_date;
	meeting_schedule_to_date;
	changeStatusLoad: boolean;
	changeStatusToCancelLoad: boolean;

	addFlag: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;
	viewFlag: boolean = false;
	manageMomFlag: boolean = false;
	modal: any;
	organization: Organization = new Organization();
	onlineMeetingAppsEnum = OnlineMeetingApps;
	RecommendationSubmitted: boolean = false;
	
	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private _organizationService: OrganizationService,
		private translate: TranslateService,
		private meetingService: MeetingService,
		private roleService: RoleService,
		private committeeService: CommitteeService,
		private modalService: NgbModal,
		private videoGuideService: VideoGuideService,
		private _userService: UserService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.getCurrentUser();
		this.checkButtonAccess();
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === true) {
			this.bindLabel = 'committee_name_ar';
			this.displayedColumns = ['meeting_title_ar', 'meeting_code',
				'meeting_schedule_from', 'meeting_venue_ar', 'committee_id', 'actions'];
		} else {
			this.displayedColumns = ['meeting_title_en', 'meeting_code',
				'meeting_schedule_from', 'meeting_venue_en', 'committee_id', 'actions'];
		}

		/** END DATE RANGE */

		this.filterObject.SearchObject = {};
		this.getUserCommittees();
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
		this.getList();
		this.checkTutorialGuide();
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'DESC';
		this.dataSourceLength = false;
		this.setDateModel();
		this._crudService.getPaginatedList<PagedResult>('admin/meetings', this.filterObject).
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


	edit(id: any) {
		this.router.navigate(['/meetings/edit', id]);
	}

	viewMeeting(id: any) {
		this.router.navigate(['/view-meetings', id]);
	}
	viewMOM(id: any) {
		this.router.navigate(['/meetings/mom', id]);
	}

	delete(id: any) {
		const _title: string = this.translate.instant('MEETINGS.DELETE.DELETEMEETING');
		const _description: string = this.translate.instant('MEETINGS.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGS.DELETE.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<Meeting>('admin/meetings', id).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.paginator.pageIndex = 0;
					this.getList();
				},
					error => {
						this.loadingSubject.next(false);
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);

						} else {
							this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);

						}
					});
		});
	}

	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.meeting_schedule_from_date = null;
		this.meeting_schedule_to_date = null;
		this.getList();
	};

	getUserCommittees() {
		this.committeeService.getOrganizationCommittees<Committee>().subscribe(res => {
			this.committees = res;
		}, error => {

		});
	}


	publishMeeting(meetingId) {
		this.changeStatusLoad = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISH.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISH.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISH.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISH.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.PUBLISH'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				return;
			}
			this.meetingService.publishMeeting(meetingId).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.changeStatusLoad = false;
					this.getList();
				},
					error => {
						this.changeStatusLoad = false;
					});
		});
	}
	publishAgendaMeeting(meetingId) {
		this.changeStatusLoad = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption,
			this.translate.instant('BUTTON.PUBLISHAGENDA'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				return;
			}
			this.meetingService.publishAgenda(meetingId).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.changeStatusLoad = false;
					this.getList();
				},
					error => {
						this.changeStatusLoad = false;
					});
		});
	}

	startMeeting(meeting) {
		this.meetingService.getMeetingAttendancePercentage<any>(meeting.id).subscribe(res => {
			if (res.show_attendance_share_percentage_warning) {
				this.layoutUtilsService.showActionNotification(
					this.translate.instant('MEETINGS.WARNING.INVALID_ATTENDANCE_SHARE_PERCENTAGE'),
					MessageType.Delete,
					5000,
					true,
					false,
					0,
					'top',
					true
				);
			}
			else if (res.show_attendance_percentage_warning) {
				const _title: string = this.translate.instant('MEETINGS.WARNING.TITLE');
				const _description: string = this.translate.instant('MEETINGS.WARNING.DESCRIPTION');
				const _waitDesciption: string = this.translate.instant('MEETINGS.WARNING.WAIT_DESCRIPTION');
	
				const dialogRef = this.layoutUtilsService.notification(_title, _description,
					_waitDesciption, this.translate.instant('BUTTON.AGREE'), false, true);
				dialogRef.afterClosed().subscribe(res => {
					if (!res) {
						return;
					}
					this.openStartMeetingModel(meeting.id);
				});
			} else {
				this.openStartMeetingModel(meeting.id);
			}
		});
		// this.changeStatusLoad = true;
		// const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.START.TITLE');
		// const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.START.DESCRIPTION');
		// const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.START.WAITDESCRIPTION');
		// const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.START.SUCCESSMESSAGE');

		// const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.START'));
		// dialogRef.afterClosed().subscribe(res => {
		// 	if (!res) {
		// 		this.changeStatusLoad = false;
		// 		return;
		// 	}
		// 	this.meetingService.startMeeting(meetingId).
		// 		subscribe(pagedData => {
		// 			this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
		// 			this.changeStatusLoad = false;
		// 			this.getList();
		// 		},
		// 			error => {
		// 				this.changeStatusLoad = false;
		// 			});
		// });
	}

	openStartMeetingModel(meetingId) {
		this.modal = this.modalService.open(StartMeetingComponent, { size: 'xl' as 'lg' });
		this.modal.componentInstance.meetingId = meetingId;
		this.modal.result.then((result) => {
			if (result) {
				this.router.navigate(['meetings/' + meetingId +
					'/meeting_agenda/' + result.agendaId +
					'/attachments/' + result.attachmentId]);
			} else {
				this.changeStatusLoad = false;
				this.getList();
			}

		}, (reason) => {

		});
	}

	endMeeting(meetingId) {
		this.changeStatusLoad = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.WAITDESCRIPTION');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.END'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				return;
			}
			const data = { 'id': meetingId };
			this.sendEndMeetingRequest(meetingId, data);
		});
	}

	sendEndMeetingRequest(meetingId, data) {
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.END.SUCCESSMESSAGE');
		this.meetingService.endMeeting(meetingId, data).
			subscribe(pagedData => {
				this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
				this.changeStatusLoad = false;
				this.getList();
			},
				error => {
					if (error.is_current_presenation) {
						const currentPresentationId = error.current_attachment_id;
						this.showCurrentPresentationPopup(meetingId, currentPresentationId);
					}
					this.changeStatusLoad = false;
				});
	}

	showCurrentPresentationPopup(meetingId, currentPresentationId) {
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.DESCRIPTION_CURRENT_PRESENTATION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.END.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.END'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				return;
			}
			const data = { 'id': meetingId, 'currentPresentationId': currentPresentationId };
			// console.log(data);
			this.sendEndMeetingRequest(meetingId, data);
		});
	}

	cancelMeeting(meetingId) {
		this.changeStatusToCancelLoad = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.CANCELED.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.CANCELED.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.CANCELED.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.CANCELED.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption,
			this.translate.instant('MEETINGS.INFO.STATUS.CANCELMEETING'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusToCancelLoad = false;
				return;
			}
			this.meetingService.cancelMeeting(meetingId).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.changeStatusToCancelLoad = false;
					this.getList();
				},
					error => {
						this.changeStatusToCancelLoad = false;
					});
		});
	}

	redraftMeeting(meetingId) {
		this.changeStatusLoad = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.REDRAFT.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.REDRAFT.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.REDRAFT.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.REDRAFT.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.UNCANCEL'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				return;
			}
			this.meetingService.redraftMeeting(meetingId).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.changeStatusLoad = false;
					this.getList();
				},
					error => {
						this.changeStatusLoad = false;
					});
		});
	}

	checkButtonAccess() {
		this.checkAddFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
		this.checkViewMeetingAccess();
		this.checkManageMom();
	}

	checkAddFlag() {
		this.roleService.canAccess(Right.ADDNEWMEETING).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}

	checkEditFlag() {
		this.roleService.canAccess(Right.EDITMEETING).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

	checkDeleteFlag() {
		this.roleService.canAccess(Right.DELETEMEETING).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => { });
	}

	checkViewMeetingAccess() {
		this.roleService.canAccess(Right.VIEWMEETING).subscribe(res => {
			if (res.canAccess === 1) {
				this.viewFlag = true;
			}
		}, error => { });
	}


	checkManageMom() {
		this.roleService.canAccess(Right.MANAGEMOM).subscribe(res => {
			if (res.canAccess === 1) {
				this.manageMomFlag = true;
			}
		}, error => { });
	}

	joinZoomMeeting(meeting: Meeting) {
		// get zoom start meeting meeting
		this.meetingService.getZoomMeetingStartUrl<any>(meeting.id).subscribe(res => {
			window.open(res.zoom_start_url, "_blank");
		}, error => {
			if (this.isArabic) {
				this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);

			} else {
				this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);

			}

		});
	}

	getCurrentUser() {
        this._userService.getCurrentUser().subscribe(res => {
			this.organization = res.user.organization;
		});
	}
	
	joinMicrosoftTeamsMeeting(meeting){
		window.open(meeting.online_meeting_start_url, "_blank");
	}

	checkTutorialGuide() {
		let list = this.videoGuideService.getGuideStepsList();
		if(list && list.length > 0){
			this.videoGuideService.startGuide(list);
		}
	}

	sendRecommend(meetingId) {
		this.changeStatusLoad = true;
		this.RecommendationSubmitted = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.WAITDESCRIPTION');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption,
			 this.translate.instant('MEETINGS.INFO.STATUS.RECOMMENDATION_SEND'),this.translate.instant('FILES.ADD')
		);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.RecommendationSubmitted = false;
				this.router.navigate(['/meetings/edit', meetingId], {
					queryParams: {
						tab: Tab.TAB12
					}
				});
				return;
			}
			this.meetingService.sendMeetingRecommendations(meetingId).subscribe(
				response => {
					const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.SUCCESSMESSAGE');
					this.RecommendationSubmitted = false;
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.changeStatusLoad = false;
				}, err => {
					this.RecommendationSubmitted = false;
					this.changeStatusLoad = false;
				}
			);
		});
	}
}
