import { MeetingService } from './../../../../core/services/meeting/meeting.service';
import { CrudService } from './../../../../core/services/shared/crud.service';

import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { NgbNav, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Tab } from '../../../../core/models/enums/tabs';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Params, ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Meeting } from '../../../../core/models/meeting';
import { MeetingStatuses } from './../../../../core/models/enums/meeting-statuses';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { PreviousRouteService } from '../../../../core/services/previous.route.service';
import { forkJoin, Observable } from 'rxjs';
import { TimeZone } from '../../../../core/models/time-zone';
import { Reminder } from '../../../../core/models/reminder';
import { Committee } from './../../../../core/models/committee';

import { UploadService } from '../../../../core/services/shared/upload.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { CommitteeService } from './../../../../core/services/committee/committee.service';
import { UserService } from '../../../../core/services/security/users.service';
import { MeetingDataPrepareService } from '../../../../core/services/meeting/meeting-data-prepare.service';
import { AgendaPurpose } from '../../../../core/models/agenda-purpose';
import { VoteType } from '../../../../core/models/vote-type';
import { MeetingComponent } from '../../../components/meetings/meeting/meeting.component';
import { Role } from '../../../../core/models/role';
import { Right } from '../../../../core/models/enums/rights';
import { RoleService } from '../../../../core/services/security/roles.service';
import { StartMeetingComponent } from '../../../components/meetings/start-meeting/start-meeting.component';
import { UserOnlineConfiguration } from '../../../../core/models/user-online-configuration';
import { MomTemplate } from '../../../../core/models/mom-template';
import { cond } from 'lodash';
import { AgendaTemplate } from '../../../../core/models/agenda-template';
import { DecisionType } from '../../../../core/models/decision-type';
import { Committees } from '../../../../core/models/enums/committees';
import { VoteParticipants } from '../../../../core/models/vote-participants';
import { EnvironmentVariableService } from '../../../../core/services/enviroment-variable/enviroment-variable.service';

@Component({
	selector: 'm-meeting-page',
	templateUrl: './meeting-page.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class MeetingPageComponent implements OnInit {

	activeIdString: string;
	addMode: boolean;
	previousUrl: string = '';
	meetingData = new Meeting();
	meetingStatus = MeetingStatuses;
	meetingId: number;
	changeStatusLoad: boolean = false;
	addRemoveLinkflag: boolean = true;
	changeStatusToCancelLoad: boolean = false;
	isArabic: boolean = false;
	submitted: boolean = false;
	tab: Tab;
	@ViewChild(NgbNav) private tabset: NgbNav;
	@ViewChild(MeetingComponent) private meetingComponent: MeetingComponent;

	committeeObs: Observable<Committee[]>;
	allCommittees: Array<Committee> = [];

	timeZones: Array<TimeZone> = [];
	timeZonesObs: Observable<TimeZone[]>;

	reminders: Array<Reminder> = [];
	remindersObs: Observable<Reminder[]>;

	momTemplates: Array<MomTemplate> = [];
	momTemplatesObs: Observable<MomTemplate[]>;

	agendaTemplatesObs: Observable<AgendaTemplate[]>;
	agendaTemplates: Array<AgendaTemplate> = [];

	currentUserObs: Observable<any>;

	selectedTimeZone: any;
	user: any;
	users: any;
	usersObs: Observable<any>;

	organizationProposalsObs: Observable<{}>;
	proposals: any;

	agendaPurposesObs: Observable<AgendaPurpose[]>;
	agendaPurposes: Array<AgendaPurpose> = [];

	voteTypesObs: Observable<VoteType[]>;
	voteTypes: VoteType[];
	isVoteEnabled: boolean;
	canManageMom: boolean = false;
	modal: any;
	publishChanges: boolean = false;
	userOnlineConfigurations: Array<UserOnlineConfiguration> = [];
	userOnlineConfigurationsObs: Observable<UserOnlineConfiguration[]>;
	selectedMom: any;
	decisionTypes: Array<DecisionType> = [];
	decisionTypesObs: Observable<DecisionType[]>;
	includeStakeholders: boolean = false;
	participants: Array<any> = [];
	guests: Array<any> = [];
	vote_participants: Array<any> = [];
	agendas: Array<any> = [];
	recommendations: Array<any> = [];

	meetingRecommendationsFeatureObs: Observable<any>;
	meetingRecommendationsFeature: boolean;
	constructor(
		private route: ActivatedRoute, private crudService: CrudService,
		private meetingService: MeetingService, private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService, private _translationService: TranslationService,
		private previousRouteService: PreviousRouteService,
		private _organizationService: OrganizationService,
		private committeeService: CommitteeService,
		private _userService: UserService,
		private meetingDataPrepareService: MeetingDataPrepareService,
		private router: Router,
		private roleService: RoleService,
		private modalService: NgbModal,
		private _environmentVariableService: EnvironmentVariableService
		) {

	}
	ngOnInit() {
		this.getLanguage();
		this.getMeetingLookups();
		this.checkButtonAccess();
		this.getMeetingRecommendationsFeatureVariable();
		this.route.params.subscribe(params => {
			forkJoin([this.currentUserObs, this.remindersObs, this.committeeObs, this.organizationProposalsObs, this.usersObs,
			this.agendaPurposesObs, this.voteTypesObs, this.userOnlineConfigurationsObs, this.momTemplatesObs, this.agendaTemplatesObs, this.decisionTypesObs,this.meetingRecommendationsFeatureObs])
				.subscribe(data => {
					this.selectedTimeZone = data[0].user.organization.time_zone;
					this.isVoteEnabled = data[0].user.organization.is_vote_enabled;
					this.user = data[0].user;
					this.reminders = data[1];
					this.allCommittees = data[2];
					this.proposals = data[3];
					this.users = data[4];
					this.agendaPurposes = data[5];
					this.voteTypes = data[6];
					this.userOnlineConfigurations = data[7];
					this.momTemplates = data[8];
					this.agendaTemplates = data[9];
					this.decisionTypes = data[10];
					this.meetingRecommendationsFeature = data[11].meetingRecommendationsFeature;
					if (params['id']) {
						this.addMode = false;
						this.meetingId = params['id'];
						this.route.queryParams.subscribe(qParams => {
							this.getMeeting(true, qParams['tab']);
						});
					} else {
						this.addMode = true;
						this.activeIdString = Tab.TAB1;
						this.meetingId = null;
						this.meetingData.can_edit_meeting = true;
						this.meetingData.time_zone_id = this.user.organization.time_zone_id;
						this.meetingDataPrepareService.initializeDate(this.meetingData);
						this.meetingDataPrepareService.initializeMap(this.meetingData);
						this.selectedMom = this.momTemplates.filter(function (item) {
							return !!item.is_default === true;
						});
						if (this.selectedMom.length > 0) {
							this.meetingData.meeting_mom_template_id = this.selectedMom[0].id;
						}

					}

				}, error => {
						// console.log('error');
					});

		});
	}

	changeTab(tabId) {
		switch (tabId) {
			case 'TAB1':
				this.activeIdString = Tab.TAB1;
				break;
			case 'TAB2':
				this.activeIdString = Tab.TAB2;
				break;
			case 'TAB3':
				this.activeIdString = Tab.TAB3;
				break;
			case 'TAB4':
				this.activeIdString = Tab.TAB4;
				break;
			case 'TAB5':
				this.activeIdString = Tab.TAB5;
				break;
			case 'TAB6':
				this.activeIdString = Tab.TAB6;
				break;
			case 'TAB7':
				this.activeIdString = Tab.TAB7;
				break;
			case 'TAB8':
				this.activeIdString = Tab.TAB8;
				break;
			case 'TAB11':
				this.activeIdString = Tab.TAB11;
				break;
			default:
				this.activeIdString = Tab.TAB1;
		}
	}

	beforeChange($event: NgbNavChangeEvent) {
		this.activeIdString = $event.nextId;
	}

	getMeeting(init: boolean = false, tabId = null) {
		this.crudService.get<Meeting>('admin/meetings-versions', this.meetingId).subscribe(res => {
			res.time_zone_id = this.user.organization.time_zone_id;
			this.meetingData = this.meetingDataPrepareService.meetingLocation(res);
			this.prepareParticipants();
			this.getSavedMeetingAgendas();
			this.getSavedMeetingRecommendations();
			if (this.meetingData.meeting_status_id === this.meetingStatus.ENDED) {
				this.addRemoveLinkflag = false;
			}
			let stakeholderCommittee = this.allCommittees.find(c => c.committee_code === Committees.STAKEHOLDERS);
			if (stakeholderCommittee && this.meetingData.committee_id === stakeholderCommittee.id) {
				this.includeStakeholders = true;
				this._userService.getOrganizationUsersStakeholders({ name: '', include_stakeholders: this.includeStakeholders }).subscribe(res => {
					this.users = res;
				})

			}
			// if (this.meetingComponent !== undefined) {
			// 	this.meetingComponent.committeeChange(init, this.meetingData.meeting_type_id);
			// }
			this.checkIfCommiteeExit();
			if (init === true) {
				this.previousUrl = this.previousRouteService.getPreviousUrl();
				if (this.previousUrl) {
					const reslt = this.previousUrl.split('\/');
					if (this.route.snapshot.queryParamMap.get('tab')) {
						this.activeIdString = this.route.snapshot.queryParamMap.get('tab');
					} else if (this.previousUrl === '/meetings/add') {
						this.activeIdString = Tab.TAB2;
					} else {
						this.activeIdString = Tab.TAB1;
					}
				}
			}
			if (tabId) {
				this.activeIdString = tabId;
			}
		},
			error => {

			});
	}

	publishMeeting() {
		this.changeStatusLoad = true;
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISH.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISH.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISH.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISH.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.PUBLISH'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.submitted = false;
				return;
			}
			this.meetingService.publishMeeting(this.meetingData.id).
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

	startMeeting() {
		this.meetingService.getMeetingAttendancePercentage<any>(this.meetingData.id).subscribe(res => {
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
						this.submitted = false;
						return;
					}
					this.openStartMeetingModel();
				});
			} else {
				this.openStartMeetingModel();
			}
		});
		// this.changeStatusLoad = true;
		// this.submitted = true;
		// const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.START.TITLE');
		// const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.START.DESCRIPTION');
		// const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.START.WAITDESCRIPTION');
		// const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.START.SUCCESSMESSAGE');

		// const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.START'));
		// dialogRef.afterClosed().subscribe(res => {
		// 	if (!res) {
		// 		this.changeStatusLoad = false;
		// 		this.submitted = false;
		// 		return;
		// 	}
		// 	this.meetingService.startMeeting(this.meetingData.id).
		// 		subscribe(pagedData => {
		// 			this.submitted = false;
		// 			this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
		// 			this.changeStatusLoad = false;
		// 			this.getMeeting();
		// 		},
		// 			error => {
		// 				this.submitted = false;
		// 				this.changeStatusLoad = false;
		// 			});
		// });
	}

	openStartMeetingModel() {
		this.modal = this.modalService.open(StartMeetingComponent, { size: 'xl' as 'lg' });
		this.modal.componentInstance.meetingId = this.meetingData.id;
		this.modal.componentInstance.is_changed_publish = this.meetingData.is_changed_publish;
		this.modal.result.then((result) => {
			if (result) {
				this.router.navigate(['meetings/' + this.meetingData.id +
					'/meeting_agenda/' + result.agendaId +
					'/attachments/' + result.attachmentId]);
			} else {
				this.submitted = false;
				this.changeStatusLoad = false;
				this.getMeeting();
			}
		}, (reason) => {

		});
	}

	publishAgendaMeeting() {
		this.changeStatusLoad = true;
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.TITLE');
		const _description: string = this.meetingData.is_changed_publish ? this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.DESCRIPTION') : this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.CHANGES_DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.PUBLISHAGENDA'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.submitted = false;
				return;
			}
			this.meetingService.publishAgenda(this.meetingData.id).
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

	endMeeting() {
		this.changeStatusLoad = true;
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.TITLE');
		const _description: string = this.meetingData.is_changed_publish ? this.translate.instant('MEETINGS.STATUSACTIONS.END.DESCRIPTION') : this.translate.instant('MEETINGS.STATUSACTIONS.END.CHANGES_DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.WAITDESCRIPTION');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.END'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.submitted = false;
				return;
			}
			const data = { 'id': this.meetingData.id };
			this.sendEndMeetingRequest(this.meetingData.id, data);
		});
	}
	sendEndMeetingRequest(meetingId, data) {
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.END.SUCCESSMESSAGE');

		this.meetingService.endMeeting(meetingId, data).
			subscribe(pagedData => {
				this.submitted = false;
				this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
				this.changeStatusLoad = false;
				this.getMeeting();
			},
				error => {
					if (error.is_current_presenation) {
						const currentPresentationId = error.current_attachment_id;
						this.showCurrentPresentationPopup(meetingId, currentPresentationId);
					}
					this.submitted = false;
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
			this.sendEndMeetingRequest(meetingId, data);
		});
	}


	goToMom() {
		this.router.navigate(['/meetings/mom', this.meetingId]);
	}

	viewMom() {
		this.router.navigate(['/preview-mom', this.meetingId]);
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

	cancelMeeting() {
		this.changeStatusToCancelLoad = true;
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.CANCELED.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.CANCELED.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.CANCELED.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.CANCELED.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption,
			this.translate.instant('MEETINGS.INFO.STATUS.CANCELMEETING'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusToCancelLoad = false;
				this.submitted = false;
				return;
			}
			this.meetingService.cancelMeeting(this.meetingData.id).
				subscribe(pagedData => {
					this.submitted = false;
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.changeStatusToCancelLoad = false;
					this.getMeeting();
				},
					error => {
						this.submitted = false;
						this.changeStatusToCancelLoad = false;
					});
		});
	}

	redraftMeeting() {
		this.changeStatusLoad = true;
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.REDRAFT.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.REDRAFT.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.REDRAFT.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.REDRAFT.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.UNCANCEL'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.submitted = false;
				return;
			}
			this.meetingService.redraftMeeting(this.meetingData.id).
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
		this.organizationProposalsObs = this._organizationService.getOrganizationProposals();

		this.currentUserObs = this._userService.getCurrentUser();

		this.remindersObs = this.crudService.getList('admin/reminders');

		this.committeeObs = this.committeeService.getUserCommittees();

		this.usersObs = this._userService.getOrganizationUsersStakeholders({ name: '', include_stakeholders: this.includeStakeholders });

		this.agendaPurposesObs = this.crudService.getList<AgendaPurpose>('admin/agenda-purposes');

		this.voteTypesObs = this.crudService.getList<VoteType>('admin/vote-types');

		this.userOnlineConfigurationsObs = this.crudService.getList<UserOnlineConfiguration>('admin/user-online-configurations');

		this.momTemplatesObs = this._organizationService.getOrganizationMomTemplates();

		this.agendaTemplatesObs = this._organizationService.getOrganizationAgendaTemplates();

		this.decisionTypesObs = this.crudService.getList<DecisionType>('admin/decision-types');
	}

	checkButtonAccess() {
		this.checkCanManageMom();
	}

	checkCanManageMom() {
		this.roleService.canAccess(Right.MANAGEMOM).subscribe(res => {
			if (res.canAccess === 1) {
				this.canManageMom = true;
			}
		}, error => { });
	}

	publishMeetingChanges() {
		this.publishChanges = true;
		const _title: string = this.translate.instant('MEETINGS.PUBLISH_CHANGES.TITLE');
		const _description: string = this.translate.instant('MEETINGS.PUBLISH_CHANGES.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.PUBLISH_CHANGES.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.PUBLISH_CHANGES.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.PUBLISH_CHANGES'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.publishChanges = false;
				return;
			}
			this.meetingService.publishMeetingChanges(this.meetingId).
				subscribe(pagedData => {
					this.publishChanges = false;
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.getMeeting();
				}, error => {
					this.publishChanges = false;
				});
		});
	}

	checkIfCommiteeExit() {
		let commiteeIndex = this.allCommittees.findIndex(committee => committee.id == this.meetingData.committee_id);
		if (commiteeIndex == -1) {
			this.crudService.get<Committee>('admin/committees', this.meetingData.committee_id).subscribe(res => {
				let committee = new Committee();
				committee.id = res['Results'].id;
				committee.committee_name_ar = res['Results'].committee_name_ar;
				committee.committee_name_en = res['Results'].committee_name_en;
				this.allCommittees.push(committee);
			});
		}
	}

	getSavedMeetingAgendas() {
		this.agendas = [];
		this.meetingData?.meeting_agendas.forEach(agenda => {
			if (agenda.id) {
				this.agendas.push(agenda);
			}
		});
	}

	prepareParticipants() {
		this.participants = this.meetingData.meeting_participants
		this.guests = this.meetingData.guests
		if (this.guests.length > 0) {
			let guestsToAdd = this.guests.map(g => {
				return { ...g, isGuest: true }
			})
			this.participants.push(...guestsToAdd)
			this.participants.sort((a, b) => {
				let aOrder = a.order ?? a?.pivot?.participant_order
				let bOrder = b.order ?? b?.pivot?.participant_order
				return aOrder - bOrder
			})
		}

		this.vote_participants = [];
		if (this.meetingData.guests.length > 0) {
			this.vote_participants = this.meetingData.guests.map(g => {
				const participant = new VoteParticipants();
				participant.id = null;
				participant.user_id = null;
				participant.meeting_guest_id = g.meeting_guest_id;
				participant.vote_id = null;
				participant.name = g.full_name ?? g.email;
				return participant;
			});
		}

		if (this.meetingData.meeting_participants.length > 0) {

			this.meetingData.meeting_participants.sort((a, b) => {
				const aOrder = a['order'] ?? a.pivot?.participant_order ?? 0;
				const bOrder = b['order'] ?? b.pivot?.participant_order ?? 0;
				return aOrder - bOrder;
			}).map((item) => {
				// Map logic here
				const participant = new VoteParticipants();
				participant.id = null;
				participant.user_id = item.id;
				participant.meeting_guest_id = null;
				participant.vote_id = null;
				participant.name = item.name_ar;
				this.vote_participants.push(participant);
			});
		}

	}

	getSavedMeetingRecommendations() {
		this.recommendations = [];
		this.meetingData?.meetingRecommendations.forEach(recommendation => {
			if (recommendation.id) {
				this.recommendations.push(recommendation);
			}
		});
	}

	getMeetingRecommendationsFeatureVariable() {
		this.meetingRecommendationsFeatureObs = this._environmentVariableService.getMeetingRecommendationsFeatureVariable();
	}

	sendRecommend() {
		this.changeStatusLoad = true;
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.WAITDESCRIPTION');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption,
			this.translate.instant('MEETINGS.INFO.STATUS.RECOMMENDATION_SEND'),this.translate.instant('FILES.ADD'),
		);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.submitted = false;
				this.activeIdString = Tab.TAB12;
				return;
			}
			this.meetingService.sendMeetingRecommendations(this.meetingId).subscribe(
				response => {
					const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.SUCCESSMESSAGE');
					this.submitted = false;
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.changeStatusLoad = false;
					this.getMeeting();
				}, err => {
					this.submitted = false;
					this.changeStatusLoad = false;
				}
			);
		});
	}
}
