import { Component, OnInit, ChangeDetectionStrategy, ViewChild, QueryList, ElementRef } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
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


import { environment } from '../../../../../environments/environment';
import { User } from '../../../../core/models/user';


// Enums
import { MeetingAttendanceStatuses } from '../../../../core/models/enums/meeting-attendance-statuses';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { NgbNavChangeEvent, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { CountdownComponent } from 'ngx-countdown';

@Component({
	selector: 'm-preview-meeting',
	templateUrl: './preview-meeting.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class PreviewMeetingComponent implements OnInit {
	activeIdString: string;
	submitted: boolean = false;
	meetingId: number;
	isArabic: boolean = false;
	meeting = new Meeting();
	public editorConfig = TextEditor;
	meetingStatuses = MeetingStatuses;
	lang: string;
	imagesBaseURL = environment.imagesBaseURL;
	edit: boolean = false;
	currentUser: User;
	currentUserObs: Observable<any>;
	mainRoles: any;
	canPresent: boolean = false;
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

	@ViewChild('cd', { read: ElementRef }) countdowns: QueryList<CountdownComponent>;
	modal: any;


	constructor(private crudService: CrudService, private route: ActivatedRoute,
		private router: Router,
		private translate: TranslateService,
		private translationService: TranslationService,
		private meetingService: MeetingService,
		private userService: UserService,
		private uploadService: UploadService,
		private layoutUtilsService: LayoutUtilsService,
		private modalService: NgbModal) {
	}

	ngOnInit() {

		// this.listenToJoinToPresentationChannel();
		// this.listenToEndPresentationChannel();
		// this.listenToChangePresenterChannel();
		this.getCurrentUser();
		this.getLanguage();

		this.route.params.subscribe(params => {
			if (params['id']) {
				this.meetingId = +params['id'];
				forkJoin([this.currentUserObs
				])
					.subscribe(data => {
						this.currentUser = data[0].user;
						this.getMeeting(null, null, true);
					}, error => {
					}
					);
			}
		});

	}


	beforeChange($event: NgbNavChangeEvent) {
		this.activeIdString = $event.nextId;
	}

	viewExtra(timer, agendaPresented) {
		if (agendaPresented === 0) {
			timer.reset();
		}
	}
	
	getCurrentUser() {
		this.currentUserObs = this.userService.getCurrentUser();
	}

	getLanguage() {
		this.isArabic = this.translationService.isArabic();
		if (this.isArabic === true) {
			this.lang = 'ar';
		} else {
			this.lang = 'en';
		}
	}

	getMeeting(agendaMeetingId?, agendaIndex?, firstLoaded?) {
		this.meetingService.getMeetingData<Meeting>(this.meetingId).subscribe(res => {
			this.meeting = res;
			this.clonedMeetingObj = Object.assign({}, this.meeting);
			this.loaded = true;
		});
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

	downloadFile(url: string, name: string) {
		this.uploadService.downloadFile(url).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = name;
			link.click();
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

	joinPresentation(agendaId, attachmentId) {
		const url = 'meetings/' + this.meetingId + '/meeting_agenda/' + agendaId + '/attachments/' + attachmentId;
		window.open(url, '_self');
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
		} else if (['avi', 'mov', 'mp4', 'wmv'].includes(extention)) {
			return 'video';
		} else if (['ppt', 'pptx'].includes(extention)) {
			return 'ppt';
		} else if (['xls', 'xlsx'].includes(extention)) {
			return 'xls';
		}
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

	publishMeetingChanges() {
		this.changeStatusLoad = true;
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.PUBLISH_CHANGES.TITLE');
		const _description: string = this.translate.instant('MEETINGS.PUBLISH_CHANGES.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.PUBLISH_CHANGES.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.PUBLISH_CHANGES.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.PUBLISH_CHANGES'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.changeStatusLoad = false;
				this.submitted = false;
				return;
			}
			this.meetingService.publishMeetingChanges(this.meeting.related_meeting_id).
				subscribe(pagedData => {
					this.changeStatusLoad = false;
					this.submitted = false;
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.router.navigate(['/meetings/edit', this.meeting.related_meeting_id]);
			},error => {
				this.changeStatusLoad = false;
				this.submitted = false;
			});
		});
	}

	back() {
		this.router.navigate(['/meetings/edit', this.meeting.related_meeting_id]);
	}

}
