import { Component, OnInit, ChangeDetectionStrategy, ViewChild, QueryList, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
// Services
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { UploadService } from './../../../../core/services/shared/upload.service';
import { UserService } from '../../../../core/services/security/users.service';

// Models
import { Meeting } from './../../../../core/models/meeting';
import { TextEditor } from '../../../../core/config/text-editor';
import { MeetingStatuses } from '../../../../core/models/enums/meeting-statuses';

import { MeetingAttendanceStatus } from '../../../../core/models/meeting-attendance-status';

import { environment } from '../../../../../environments/environment';
import { User } from '../../../../core/models/user';


// Enums
import { MeetingAttendanceStatuses } from '../../../../core/models/enums/meeting-attendance-statuses';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { NgbNavChangeEvent, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CountdownComponent } from 'ngx-countdown';

import { RejectionReasonsComponent } from '../rejection-reasons/rejection-reasons.component';
import { StartMeetingComponent } from '../../meetings/start-meeting/start-meeting.component';
import { OnlineMeetingApps } from '../../../../core/models/enums/online-meeting-apps';
import { ViewMeetingStatisticsComponent } from '../view-meeting-statistics/view-meeting-statistics.component';
import { VoteResultStatuses } from '../../../../core/models/enums/vote-result-statuses';
import { VoteStatus } from '../../../../core/models/vote-status';
import { VoteStatuses } from '../../../../core/models/enums/vote-statuses';
import { Tab } from '../../../../core/models/enums/tabs';
import { RoleService } from '../../../../core/services/security/roles.service';
import { Right } from '../../../../core/models/enums/rights';
import { ApprovalService } from '../../../../core/services/approval/approval.service';

import { EnvironmentVariableService } from '../../../../core/services/enviroment-variable/enviroment-variable.service';

@Component({
	selector: 'm-view-meeting',
	templateUrl: './view-meeting.component.html',
	changeDetection: ChangeDetectionStrategy.Default




})


export class ViewMeetingComponent implements OnInit {
	[x: string]: any;
	activeIdString: string;
	submitted: boolean = false;
	meetingId: number;
	isArabic: boolean = false;
	meeting = new Meeting();
	meetingAttendanceStatusesObs: Observable<MeetingAttendanceStatus[]>;
	public editorConfig = TextEditor;
	meetingStatuses = MeetingStatuses;
	lang: string;
	imagesBaseURL = environment.imagesBaseURL;
	meetingAttendanceStatuses: Array<MeetingAttendanceStatus> = [];
	edit: boolean = false;
	currentUser: User;
	currentUserObs: Observable<any>;
	mainRoles: any;
	canPresent: boolean = false;
	agreeStatusLoad: boolean = false;
	checkAppear: boolean = true;
	MeetingAttendanceStatuses = MeetingAttendanceStatuses;
	currentPresentingAttachmentObs: Observable<any>;
	currentPresentationData: any;
	isPresenting: boolean = false;
	clonedMeetingObj: Meeting;
	meetingMemberIds: Array<number> = [];
	counter: number;
	counterww$: Observable<number>;
	loaded: boolean = false;
	isLessMinute: Array<boolean> = [];
	isthreeMinute: Array<boolean> = [];
	isMore: Array<boolean> = [];
	environment = environment;
	closeResult: string;
	changeStatusLoad: boolean = false;
	changeStatusToCancelLoad: boolean = false;
	onlineMeetingAppsEnum = OnlineMeetingApps;
	panelActiveIds: Array<any> = [];
	voteResultStatusesEnum = VoteResultStatuses;
	voteStatuses: Array<VoteStatus> = [];
	voteStatusEnum = VoteStatuses;
	voteStatusesObs: Observable<VoteStatus[]>;
	accessRightsObs: Observable<any[]>;
	accessRights: Array<any> = new Array<any>();

	@ViewChild('cd', { read: ElementRef }) countdowns: QueryList<CountdownComponent>;
	modal: any;
	user: any;
	activeModal: any;
	rightEnum = Right;
	participants: Array<any>
	signBtnLoading = false;

    meetingRecommendationsFeatureObs: Observable<any>;
	meetingRecommendationsFeature: boolean;

	constructor(private crudService: CrudService, private route: ActivatedRoute,
		private router: Router,
		private translate: TranslateService,
		private _approvalService: ApprovalService,
		private translationService: TranslationService,
		private meetingService: MeetingService,
		private userService: UserService,
		private uploadService: UploadService,
		private layoutUtilsService: LayoutUtilsService,
		private modalService: NgbModal,
		private _roleService: RoleService,
		private _crudService: CrudService,
		private _environmentVariableService: EnvironmentVariableService) {
	}

	ngOnInit() {
		this.getAccessRights();
		this.listenToJoinToPresentationChannel();
		this.listenToEndPresentationChannel();
		this.listenToChangePresenterChannel();
		this.getCurrentUser();
		this.getLanguage();
		this.getMeetingAttendanceStatuses();
		this.listenToMeetingChangeChannel();
		this.getVoteStauses();
		this.getMeetingRecommendationsFeatureVariable();
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.meetingId = +params['id'];
				forkJoin([this.meetingAttendanceStatusesObs, this.currentUserObs, this.voteStatusesObs,
				this.accessRightsObs,this.meetingRecommendationsFeatureObs])
					.subscribe(data => {
						this.accessRights = data[3];
						this.meetingAttendanceStatuses = data[0];
						this.currentUser = data[1].user;
						this.voteStatuses = data[2];
						this.voteStatuses = data[2];
						this.meetingRecommendationsFeature = data[4].meetingRecommendationsFeature;
						if (!this.route.snapshot.queryParams.exit) {
							this.getCurrentPresentingAttachment(this.meetingId);
						}

						this.getMeeting(null, null, true);
					}, error => {

					}
					);
			}
		});

	}

	getAccessRights() {
		this.accessRightsObs = this._roleService.getAllRoleAccessRights();
	}

	HasAccessToRight(rightID) {
		return this.accessRights.find(item => item.id == rightID) != null;
	}

	beforeChange($event: NgbNavChangeEvent) {
		this.activeIdString = $event.nextId;
	}

	viewExtra(timer, agendaPresented) {
		if (agendaPresented === 0) {
			timer.reset();
		}
	}

	getCurrentPresentingAttachment(meetingId) {
		this.meetingService.getCurrentPresentingAttachment(meetingId).subscribe(res => {
			this.currentPresentationData = res;
			let message;
			let title;
			if (this.isArabic) {
				message = this.currentPresentationData.notificationMessageAr;
				title = this.currentPresentationData.notificationTitleAr;
			} else {
				message = this.currentPresentationData.notificationMessageEn;
				title = this.currentPresentationData.notificationTitleEn;
			}
			const attachmentId = +this.currentPresentationData.attachmentId;
			const meetingAgendaId = +this.currentPresentationData.meetingAgendaId;


			const presenterUserId = +this.currentPresentationData.presenterUserId;
			const url = 'meetings/' + meetingId + '/meeting_agenda/' + meetingAgendaId + '/attachments/' + attachmentId;
			if (this.currentUser.id !== presenterUserId && this.currentPresentationData.can_access == true) {
				this.showPresentationPopup(title, message, url);
			}

		});
	}
	showPresentationPopup(title, description, url) {

		const _title: string = title;
		const _description: string = description;
		const _waitDesciption: string = '';
		const _activationMessage = ``;
		const _buttonText = this.translate.instant('PRESENTATION.JOIN_PRESENTATION');
		const dialogRef = this.layoutUtilsService.activateElement(_title, _description, _waitDesciption, _buttonText);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			window.open(url, '_self');

		});
	}
	getCurrentUser() {
		this.currentUserObs = this.userService.getCurrentUser();
	}

	getMeetingAttendanceStatuses() {
		this.meetingAttendanceStatusesObs = this.crudService.getList('admin/meeting-attendance-statuses');
	}


	getLanguage() {
		this.isArabic = this.translationService.isArabic();
		if (this.isArabic === true) {
			this.lang = 'ar';
		} else {
			this.lang = 'en';
		}
	}

	endVote(voteId) {
		this.meetingService.endVote(this.meetingId, { 'vote_id': voteId }).subscribe(res => {
			this.getMeeting(null, null, true);
		}, error => {

		});
	}

	startVote(voteId) {
		this.meetingService.startVote(this.meetingId, { 'vote_id': voteId }).subscribe(res => {
			this.getMeeting(null, null, true);
		}, error => {

		});
	}

	addVote() {
		this.router.navigate(['/meetings/edit', this.meetingId], {
			queryParams: {
				tab: Tab.TAB6,
				agendaId: this.meeting.current_agenda.id,
				attachmnetId: this.attachmentId
			}
		});
	}

	getVoteStauses() {
		this.voteStatusesObs = this._crudService.getList('admin/vote-statuses');
	}
	panelChanges(event) {
		// this.handleActivePanelEmitter.emit(event);
	}

	changeVoteStatus(voteResult: any, statusId: number, voteId: number) {
		if (statusId === VoteStatuses.YES) {
			this.meetingService.changeVoteResultToYes(voteId, this.meetingId).subscribe(() => {
				this.getMeeting(null, null, true);
			});
		} else if (statusId === VoteStatuses.NO) {
			this.meetingService.changeVoteResultToNo(voteId, this.meetingId).subscribe(() => {
				this.getMeeting(null, null, true);
			});

		} else if (statusId === VoteStatuses.MAYATTEND) {
			this.meetingService.changeVoteResultToAbstained(voteId, this.meetingId).subscribe(() => {
				this.getMeeting(null, null, true);
			});
		}

	}
	getMeeting(agendaMeetingId?, agendaIndex?, firstLoaded?) {
		this.meetingService.getMeetingAllData<Meeting>(this.meetingId).subscribe(res => {
			this.meeting = res;
			this.prepareParticipants()
			this.clonedMeetingObj = Object.assign({}, this.meeting);

			this.panelActiveIds = [];
			if (this.meeting.meetingAgendas && this.meeting.meetingAgendas[0]?.agenda_votes.length > 0) {
				this.panelActiveIds.push('ngb-panel-votes-' + this.meeting.meetingAgendas[0].agenda_votes[0].id);
			}
			this.loaded = true;
		});
	}

	prepareParticipants() {
		this.participants = this.meeting.meeting_participants
		let logoImage = this.participants[0].organization.logo_image.image_url
		let guests = this.meeting.guests
		if (guests?.length > 0) {
			let guestsToAdd = guests.map(g => {
				return {
					...g,
					isGuest: true,
					image: {
						image_url: logoImage
					}
				}
			})
			this.participants.push(...guestsToAdd)
			this.participants.sort((a, b) => {
				let aOrder = a.order ?? a?.pivot?.participant_order
				let bOrder = b.order ?? b?.pivot?.participant_order
				return aOrder - bOrder
			})
		}
	}

	viewMom() {
		this.router.navigate(['/preview-mom', this.meetingId]);
	}


	handleEvent(e, agendaIndex) {
		if (e.left <= 60000) {
			this.isthreeMinute[agendaIndex] = false;
			this.isMore[agendaIndex] = false;
			this.isLessMinute[agendaIndex] = true;

		} else if (e.left <= 180000) {
			this.isLessMinute[agendaIndex] = false;
			this.isMore[agendaIndex] = false;
			this.isthreeMinute[agendaIndex] = true;

		} else {
			this.isthreeMinute[agendaIndex] = false;
			this.isLessMinute[agendaIndex] = false;
			this.isMore[agendaIndex] = true;

		}
		if (e.action === 'finished') {
			if (this.meeting.meeting_agendas[agendaIndex].extraTime === 0) {
				this.meeting.meeting_agendas[agendaIndex].extraTime = 1;
			}
		}
	}

	hasError(meetingForm: NgForm, field: string, validation: string) {
		if (meetingForm && Object.keys(meetingForm.form.controls).length > 0 &&
			meetingForm.form.controls[field].errors && validation in meetingForm.form.controls[field].errors) {
			if (validation) {
				return (meetingForm.form.controls[field].dirty &&
					meetingForm.form.controls[field].errors[validation]) || (this.edit && meetingForm.form.controls[field].errors[validation]);
			}
			return (meetingForm.form.controls[field].dirty &&
				meetingForm.form.controls[field].invalid) || (this.edit && meetingForm.form.controls[field].invalid);
		}
	}

	downloadFile(url: string, name: string) {
		this.uploadService.downloadFile(url).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = name;
			link.click();
		});
	}

	downloadMom() {
		this.meetingService.downloadMomPdf(this.meetingId, this.lang).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = this.isArabic ?
				(this.meeting.meeting_title_ar ? this.meeting.meeting_title_ar + '.pdf' : this.meeting.meeting_title_en + '.pdf') :
				(this.meeting.meeting_title_en ? this.meeting.meeting_title_en + '.pdf' : this.meeting.meeting_title_ar + '.pdf');
			link.click();
		});

	}
	sendTarasul() {

		async function convertDownloadURLToBase64(downloadURL: string): Promise<string> {
			const response = await fetch(downloadURL);
			const blob = await response.blob();
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onloadend = () => {
					resolve(reader.result as string);
				};
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
		}

		this.modal = this.modalService.open(StartMeetingComponent, { size: 'xl' as 'lg' });
		this.modal.componentInstance.meetingId = this.meeting.id;
		this.modal.result.then((result) => {
			if (result) {
				this.router.navigate(['meetings/' + this.meeting.id +
				'/meeting_agenda/' + result.agendaId +
				'/attachments/' + result.attachmentId]);
			} else {
				this.submitted = false;
				this.changeStatusLoad = false;
				this.getMeeting();
			}
		}, (reason) => {

		});



		this.meetingService.downloadMomPdf(this.meetingId, this.lang).subscribe(async (response) => {
			const downloadURL = window.URL.createObjectURL(response);

			const fileBase64 = await convertDownloadURLToBase64(downloadURL);


		});

	}

	sign() {
		// const lang = this.currentUser.language_id == Languages.AR ? 'ar' : (this.currentUser.language_id == Languages.EN ? 'en' : '');
		const lang = this.isArabic ? 'ar' : 'en';
		this.meetingService.loginUserToSignature(this.meetingId).subscribe((response) => {
			if (response.token) {
				window.open(environment.signatureFrontUrl + '?token=' + response.token + '&lang=' + lang + '&timeZone=' + response.timeZone, '_self');
			}
		});
	}

	startMeeting() {
		this.meetingService.getMeetingAttendancePercentage<any>(this.meeting.id).subscribe(res => {
			if (res.show_attendance_percentage_warning) {
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
	}

	openStartMeetingModel() {
		this.modal = this.modalService.open(StartMeetingComponent, { size: 'xl' as 'lg' });
		this.modal.componentInstance.meetingId = this.meeting.id;
		this.modal.result.then((result) => {
			if (result) {
				this.router.navigate(['meetings/' + this.meeting.id +
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
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.PUBLISHAGENDA.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.PUBLISHAGENDA'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.submitted = false;
				return;
			}
			this.meetingService.publishAgenda(this.meeting.id).
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
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.END.WAITDESCRIPTION');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.END'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.submitted = false;
				return;
			}
			const data = { 'id': this.meeting.id };
			this.sendEndMeetingRequest(this.meeting.id, data);
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


	sendEmail() {
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
			this.meetingService.sendEmailAfterEndMeeting(this.meeting.id).
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
			this.meetingService.cancelMeeting(this.meeting.id).
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
			this.meetingService.redraftMeeting(this.meeting.id).
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


	joinPresentation(agendaId, attachmentId) {
		const url = 'meetings/' + this.meetingId + '/meeting_agenda/' + agendaId + '/attachments/' + attachmentId;
		window.open(url, '_self');
	}

	presentAttachment(agendaId: number, attachmentId: number) {
		const presentationSpinnerIcon = document.getElementById('spinner_' + attachmentId + '');
		presentationSpinnerIcon.style.display = 'block';

		this.meetingService.presentMeetingAttachment(this.meetingId, attachmentId).subscribe((res) => {
			this.getMeeting();
			const url = 'meetings/' + this.meetingId + '/meeting_agenda/' + agendaId + '/attachments/' + attachmentId;
			window.open(url, '_self');
			presentationSpinnerIcon.style.display = 'none';
		},
			error => {
				if (this.isArabic) {
					this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Create);

				} else {
					this.layoutUtilsService.showActionNotification(error.error, MessageType.Create);
				}
				presentationSpinnerIcon.style.display = 'none';
			});
	}


	checkFileType(url: string) {
		let extention = url.split('.').pop();
		if (extention) {
			extention = extention.toLowerCase();
		}
		if (['jpeg', 'jpg', 'png'].includes(extention)) {
			return 'image';
		} else if (extention === 'pdf') {
			return 'pdf';
		} else if (['doc', 'docx'].includes(extention)) {
			return 'doc';
		} else if (['avi', 'mov', 'mp4', '4mp', 'wmv'].includes(extention)) {
			return 'video';
		} else if (['ppt', 'pptx'].includes(extention)) {
			return 'ppt';
		} else if (['xls', 'xlsx'].includes(extention)) {
			return 'xls';
		}
	}

	changeAttendStatus(statusId: number) {
		let _title: string;
		let _description: string;
		let _waitDesciption: string;
		let _message: string;

		if (statusId === MeetingAttendanceStatuses.ATTEND) {
			_title = this.translate.instant('VIEW_MEETING.MEETINGATTENDANCESTATUS.ATTEND.ATTENDMEETING');
			_description = this.translate.instant('VIEW_MEETING.MEETINGATTENDANCESTATUS.ATTEND.DESCRIPTION');
			_waitDesciption = this.translate.instant('VIEW_MEETING.MEETINGATTENDANCESTATUS.ATTEND.WAITDESCRIPTION');
			_message = this.translate.instant('VIEW_MEETING.MEETINGATTENDANCESTATUS.ATTEND.ATTENDMESSAGE');
			// tslint:disable-next-line:max-line-length
			const dialogRef = this.layoutUtilsService.activateElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.CONFIRM'));
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					this.meeting.participant_meeting_attendance_status_id = this.clonedMeetingObj.participant_meeting_attendance_status_id;
					return;
				}
				this.meetingService.attendMeenting(this.meetingId).subscribe(() => {
					this.layoutUtilsService.showActionNotification(_message, MessageType.Create);

					this.getMeeting();
				});
			});
		} else if (statusId === MeetingAttendanceStatuses.ABSENT) {
			_message = this.translate.instant('VIEW_MEETING.MEETINGATTENDANCESTATUS.ABSENT.ABSENTMESSAGE');
			const modelRef = this.modalService.open(RejectionReasonsComponent, { size: 'xl' as 'lg' });
			modelRef.result.then((result) => {
				this.meetingService.absentMeenting(this.meetingId, result).subscribe(() => {
					this.layoutUtilsService.showActionNotification(_message, MessageType.Create);
					this.getMeeting();
				});

			}, (reason) => {
				this.meeting.participant_meeting_attendance_status_id = this.clonedMeetingObj.participant_meeting_attendance_status_id;
				this.getMeeting();
			});

		} else if (statusId === MeetingAttendanceStatuses.MAYATTEND) {
			_title = this.translate.instant('VIEW_MEETING.MEETINGATTENDANCESTATUS.MAYATTEND.MAYATTENDMEETING');
			_description = this.translate.instant('VIEW_MEETING.MEETINGATTENDANCESTATUS.MAYATTEND.DESCRIPTION');
			_waitDesciption = this.translate.instant('VIEW_MEETING.MEETINGATTENDANCESTATUS.MAYATTEND.WAITDESCRIPTION');
			_message = this.translate.instant('VIEW_MEETING.MEETINGATTENDANCESTATUS.MAYATTEND.MAYATTENDMESSAGE');
			// tslint:disable-next-line:max-line-length
			const dialogRef = this.layoutUtilsService.activateElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.CONFIRM'));
			dialogRef.afterClosed().subscribe(res => {
				if (!res) {
					this.meeting.participant_meeting_attendance_status_id = this.clonedMeetingObj.participant_meeting_attendance_status_id;
					return;
				}
				this.meetingService.mayAttendMeenting(this.meetingId).subscribe(() => {
					this.layoutUtilsService.showActionNotification(_message, MessageType.Create);
					this.getMeeting();
				});
			});
		}
	}

	agree() {
		this.agreeStatusLoad = true;
		this.meetingService.takeParticipantAttendance(this.meetingId).subscribe(res => {
			this.agreeStatusLoad = false;
			this.checkAppear = false;
		}, error => {
			this.agreeStatusLoad = false;
		});
	}


	listenToJoinToPresentationChannel() {
		window.Echo.channel('presentAttachmentToParticipants')
			.listen('.PresentAttachmentToParticipantsEvent', (data) => {
				this.getMeeting();
				const attachmentId = +data.data.attachmentId;
				const presentationIcon = document.getElementById('' + attachmentId + '');
				if (presentationIcon) {
					presentationIcon.classList.add('open');
				}
				/**/
			}, (e) => {
				console.log(e);
			});

	}

	listenToEndPresentationChannel() {
		window.Echo.channel('endPresentation')
			.listen('.EndPresentationEvent', (data) => {
				const attachmentId = +data.data.attachment_id;
				const presentationIcon = document.getElementById('' + attachmentId + '');
				if (presentationIcon) {
					presentationIcon.classList.remove('open');

				}
				this.getMeeting();
				/**/
			}, (e) => {
				console.log(e);
			});
	}

	endPresentAttachment(agendaId: number, attachmentId: number) {
		const _title: string = this.translate.instant('PRESENTATION.END.ENDPRESENTATION');
		const _description: string = this.translate.instant('PRESENTATION.END.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('PRESENTATION.END.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('PRESENTATION.END.DELETEMESSAGE');
		this.layoutUtilsService.logOut();
		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption,
			this.translate.instant('PRESENTATION.END_PRESENTATION'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.fireClosePointer(attachmentId);
			this.meetingService
				.endPresentation(this.meetingId, attachmentId)
				// tslint:disable-next-line:no-shadowed-variable
				.subscribe(res => {
					this.getMeeting();
					this.layoutUtilsService.showActionNotification(this.translate.instant('PRESENTATION.END.DELETEMESSAGE'));
				});
		});
	}

	fireClosePointer(attachmentId) {
		const data = { key: 'pointer_closed' };

	}

	publishEvent(data, attachmentId) {
		data.attachmentId = attachmentId;
		data.meetingMemberIds = this.meetingMemberIds;

		this.meetingService
			.broadCastPresentationSlideNotes(attachmentId, data)
			.subscribe(
				res => {
					// console.log(res);
				},
				error => { }
			);
	}

	listenToChangePresenterChannel() {
		window.Echo.channel('changePresenter').listen(
			'.ChangePresenterEvent',
			data => {
				this.getMeeting();
			}, e => { }
		);
	}

	openParticipantsStatistics() {
		const modalRef = this.modalService.open(ViewMeetingStatisticsComponent);
		modalRef.componentInstance.statisticsDataAr = this.meeting.participantStatistics.statisticsDataAr;
		modalRef.componentInstance.statisticsDataEn = this.meeting.participantStatistics.statisticsDataEn;
		modalRef.componentInstance.meetingData = this.meeting;
	}

	listenToMeetingChangeChannel() {
		window.Echo.channel('meetingDataChanged').listen('.MeetingDataChangedEvent',
			data => {
				this.getMeeting();
			}, e => { }
		);
	}

	CanSignApproval(members) {
		const currentMember = members.find(item => item.member_id == this.currentUser?.id);
		if (!currentMember) {
			return false;
		}
		if(currentMember.is_signed != null) {
			return false;
		} else {
			return true;
		}
	}

	goToDigitalSignature(approvalId) {
		const lang = this.isArabic ? 'ar' : 'en';
		this.signBtnLoading = true;
		this._approvalService.loginUserToSignature(approvalId).subscribe((response) => {
			if (response.token) {
				this.signBtnLoading = false;
				window.open(environment.signatureFrontUrl + '?token=' + response.token + '&lang=' + lang + '&timeZone=' + response.timeZone, '_self');
			}
		}, err => {
			this.signBtnLoading = false;
		});
	}

	sendRecommend() {
		this.changeStatusLoad = true;
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.TITLE');
		const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.SEND_RECOMMENDATION.WAITDESCRIPTION');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption,
			 this.translate.instant('MEETINGS.INFO.STATUS.RECOMMENDATION_SEND'),this.translate.instant('FILES.ADD')
		);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.submitted = false;
				this.router.navigate(['/meetings/edit', this.meetingId], {
					queryParams: {
						tab: Tab.TAB12
					}
				});
				return;
			}
			this.meetingService.sendMeetingRecommendations(this.meeting.id).subscribe(
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

	getMeetingRecommendationsFeatureVariable() {
		this.meetingRecommendationsFeatureObs = this._environmentVariableService.getMeetingRecommendationsFeatureVariable();
	}
}
