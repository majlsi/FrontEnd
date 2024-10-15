import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


// Services
import { TranslationService } from '../../../../../core/services/translation.service';
import { MeetingService } from '../../../../../core/services/meeting/meeting.service';
import { UploadService } from '../../../../../core/services/shared/upload.service';


// Models
import { Meeting } from '../../../../../core/models/meeting';
import { MeetingStatuses } from '../../../../../core/models/enums/meeting-statuses';
import { environment } from '../../../../../../environments/environment';


// Enums
import { MeetingAttendanceStatuses } from '../../../../../core/models/enums/meeting-attendance-statuses';
import { LayoutUtilsService, MessageType } from '../../../../../core/services/layout-utils.service';
import { OnlineMeetingApps } from '../../../../../core/models/enums/online-meeting-apps';

@Component({
	selector: 'm-meeting-info-aside',
	templateUrl: './meeting-info-aside.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class MeetingInfoAsideComponent implements OnInit {

	meetingId: number;
	isArabic: boolean = false;
	@Input() meeting = new Meeting();

	meetingStatuses = MeetingStatuses;
	lang: string;
	imagesBaseURL = environment.imagesBaseURL;

	MeetingAttendanceStatuses = MeetingAttendanceStatuses;

	@Output() getPresentationEmitter = new EventEmitter();
	onlineMeetingAppsEnum = OnlineMeetingApps;

	constructor(private route: ActivatedRoute,
		private translate: TranslateService,
		private translationService: TranslationService,
		private meetingService: MeetingService,
		private uploadService: UploadService,
		private layoutUtilsService: LayoutUtilsService) {
	}

	ngOnInit() {
		this.getLanguage();
		this.route.params.subscribe(params => {
			if (params['meeting_id']) {
				this.meetingId = +params['meeting_id'];
			}
		});
	}

	getLanguage() {
		this.isArabic = this.translationService.isArabic();
		if (this.isArabic === true) {
			this.lang = 'ar';
		} else {
			this.lang = 'en';
		}
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

	downloadFile(url: string, name: string) {
		this.uploadService.downloadFile(url).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = name;
			link.click();
		});
	}


	fireClosePointer(attachmentId) {
		const data = { key: 'pointer_closed' };

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
				.endPresentationWithOutNotification(this.meetingId, attachmentId)
				// tslint:disable-next-line:no-shadowed-variable
				.subscribe(res => {
					this.getPresentationEmitter.emit(attachmentId);
					this.layoutUtilsService.showActionNotification(this.translate.instant('PRESENTATION.END.DELETEMESSAGE'));
				},
				error => {
					if (this.isArabic) {
						this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Create);

					} else {
						this.layoutUtilsService.showActionNotification(error.error, MessageType.Create);
					}
				});
		});
	}

	presentAttachment(agendaId: number, attachmentId: number) {
		const presentationSpinnerIcon = document.getElementById('spinner_' + attachmentId + '');
		presentationSpinnerIcon.style.display = 'block';

		this.meetingService.presentMeetingAttachmentWithOutEndNotification(this.meetingId, attachmentId).subscribe((res) => {
			// this.getPresentationEmitter.emit(attachmentId);
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


}
