import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Tab } from '../../../../core/models/enums/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { PreviousRouteService } from '../../../../core/services/previous.route.service';
import { UserService } from '../../../../core/services/security/users.service';
import { MeetingDataPrepareService } from '../../../../core/services/meeting/meeting-data-prepare.service';
import { forkJoin, Observable } from 'rxjs';
import { Meeting } from '../../../../core/models/meeting';
import { MeetingStatuses } from '../../../../core/models/enums/meeting-statuses';
import { MeetingComponent } from '../../../components/meetings/meeting/meeting.component';
import { Location } from '@angular/common';
import { TaskStatus } from '../../../../core/models/task-status';
import { MomTemplate } from '../../../../core/models/mom-template';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { HtmlMomTemplate } from '../../../../core/models/html-mom-template';


@Component({
	selector: 'm-mom-page',
	templateUrl: './mom-page.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class MOMPageComponent implements OnInit {

	activeIdString: string;
	previousUrl: string = '';
	proposalBindLabel = 'proposal_title';
	meetingData = new Meeting();
	meetingStatus = MeetingStatuses;
	meetingId: number;
	changeStatusLoad: boolean = false;
	changeStatusToCancelLoad: boolean = false;
	isArabic: boolean = false;
	submitted: boolean = false;
	meetingStatuses = MeetingStatuses;
	momTemplates: Array<MomTemplate> = [];
	momTemplatesObs: Observable<MomTemplate[]>;
	momSummaryTemplatesObs: Observable<HtmlMomTemplate[]>;
	momSummaryTemplates: Array<HtmlMomTemplate> = [];

	currentUserObs: Observable<any>;
	selectedTimeZone: any;
	user: any;
	users: any;
	usersObs: Observable<any>;
	taskStatus: Array<TaskStatus> = [];

	constructor(
		private route: ActivatedRoute, private crudService: CrudService,
		private meetingService: MeetingService, private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService, private _translationService: TranslationService,
		private _organizationService: OrganizationService,
		private _userService: UserService,
		private meetingDataPrepareService: MeetingDataPrepareService,
		private router: Router) {

	}
	ngOnInit() {
		this.getLanguage();
		this.getMeetingLookups();
		this.getTaskStatuses();
		this.route.params.subscribe(params => {
			forkJoin([this.currentUserObs, this.usersObs, this.momTemplatesObs, this.momSummaryTemplatesObs])
				.subscribe(data => {
					this.user = data[0].user;
					this.users = data[1];
					this.momTemplates = data[2];
					this.momSummaryTemplates = data[3];
					if (params['id']) {
						this.meetingId =  +params['id'];
						this.getMeeting();
						this.activeIdString = Tab.TAB7; 
					}
				},
					error => {
						// console.log('error');
					});

		});
	}

	changeTab(tabId) {
		switch (tabId) {
			case 'TAB7':
				this.activeIdString = Tab.TAB7;
				break;
			case 'TAB3':
				this.activeIdString = Tab.TAB3;
				break;
			case 'TAB9':
				this.activeIdString = Tab.TAB9;
				break;
			default:
				this.activeIdString = Tab.TAB7;
		}
	}

	beforeChange($event: NgbNavChangeEvent) {
		this.activeIdString = $event.nextId;
	}

	getMeeting() {
		this.crudService.get<Meeting>('admin/meetings', this.meetingId).subscribe(res => {
			res.time_zone_id = this.user.organization.time_zone_id;
			this.meetingData = this.meetingDataPrepareService.meetingLocation(res);
		},
			error => {

			});
	}

	sendMom() {
		this.changeStatusLoad = true;
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.SENDEMAIL.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.SENDEMAIL.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.SENDEMAIL.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.SENDEMAIL.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.SEND'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.submitted = false;
				return;
			}
			this.meetingService.sendEmailAfterEndMeeting(this.meetingData.id).
				subscribe(pagedData => {
					this.submitted = false;
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.changeStatusLoad = false;
					this.getMeeting();
				},
					error => {
						this.submitted = false;
						this.changeStatusLoad = false;
						this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Delete);
					});
		});
	}

	sendSignEmail() {
		const _title: string = this.translate.instant('MEETINGS.SEND_SIGNATURE_MAIL.TITLE');
		const _description: string = this.translate.instant('MEETINGS.SEND_SIGNATURE_MAIL.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.SEND_SIGNATURE_MAIL.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.SEND_SIGNATURE_MAIL.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.SEND'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.submitted = false;
				return;
			}
			this.meetingService.sendSignatureMail(this.meetingId).
				subscribe(pagedData => {
					this.submitted = false;
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.changeStatusLoad = false;
					this.getMeeting();
				},
					error => {
						this.submitted = false;
						this.changeStatusLoad = false;
					});
		});

	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	getMeetingLookups() {
		this.currentUserObs = this._userService.getCurrentUser();
		this.usersObs = this._userService.getMatchedOrganizationUsers({ name: '' });
		this.momTemplatesObs = this._organizationService.getOrganizationMomTemplates();
		this.momSummaryTemplatesObs = this._organizationService.getOrganizationMomSummaryTemplates();
	}

	back() {
		this.router.navigate(['/meetings/edit', this.meetingId]);
	}

	getTaskStatuses() {
		this.crudService.getList<TaskStatus>('admin/task-statuses').subscribe(
			res => {
				this.taskStatus = res;
			},
			error => {
				// console.log('error');
			});
	}

	viewMom() {
		this.router.navigate(['/preview-mom', this.meetingId]);
	}

}
