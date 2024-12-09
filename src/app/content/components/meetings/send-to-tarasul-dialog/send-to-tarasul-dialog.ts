import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { Component, Inject, OnInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// Services
import { TranslationService } from '../../../../core/services/translation.service';
import { NgForm } from '@angular/forms';
import { MeetingAgenda } from '../../../../core/models/meeting-agenda';
import { Attachment } from '../../../../core/models/attachment';
import { MessageType, LayoutUtilsService } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
	selector: 'm-send-to-tarasul-dialog',
	templateUrl: './send-to-tarasul-dialog.html'
})
export class SendToTarasulDialog implements OnInit {
	presenation = { 'agendaId': null, 'attachmentId': null };
	closeResult: string;
	submitted: boolean = false;
	edit: boolean = false;
	@Input() meetingId: number;
	@Input() is_changed_publish: boolean;
	agendas: Array<MeetingAgenda> = [];
	agendaAttachments: Array<Attachment> = [];
	agendabindLabel: string;
	isArabic: boolean;

	constructor(private modalService: NgbModal, private meetingService: MeetingService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		public activeModal: NgbActiveModal,
		private layoutUtilsService: LayoutUtilsService
	) { }

	ngOnInit() {
		this.getLanguage();
		this.getMeetingAgendas();
	}


	open() {

	}

	getMeetingAgendas() {
		this.meetingService.getMeetingAgendasForMeeting<MeetingAgenda>(this.meetingId).subscribe(res => {
			this.agendas = res;
			const startWithoutPresentation = new MeetingAgenda();
			startWithoutPresentation.agenda_title_en = 'Start Meeting Without Presentation';
			startWithoutPresentation.agenda_title_ar = 'بدء الإجتماع بدون عرض تقديمي';
			startWithoutPresentation.id = 0;
			this.agendas.push(startWithoutPresentation);
			if (res.length > 0) {
				this.presenation.agendaId = res[0].id;
				this.autoFillAttachments(this.presenation.agendaId);
			}
		},
			error => {
				this.submitted = false;
			});

	}

	autoFillAttachments(agendaId) {
		this.agendaAttachments = [];
		this.presenation.attachmentId = null;
		if (agendaId === 0) {
			return;
		}
		const selectedAgenda = this.agendas.filter(function (item) {
			return item.id === agendaId;
		});
		if (selectedAgenda.length > 0) {
			this.agendaAttachments = selectedAgenda[0].agenda_attachments;
			if (this.agendaAttachments.length > 0) {
				this.presenation.attachmentId = this.agendaAttachments[0].id;
			}
		}

	}

	startWithoutPresenting() {
		const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.START.SUCCESSMESSAGE');

		this.meetingService.startMeeting(this.meetingId).subscribe(pagedData => {
			this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
			this.close();
			this.activeModal.close();

		},
			error => {

			});
	}

	save(startMeetingForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		if (startMeetingForm.valid) {

			if (this.presenation.agendaId === 0) {
				// this.startWithoutPresenting();
			} else {
				// this.meetingService.startMeeting(this.meetingId, this.presenation.attachmentId).subscribe(res => {
				// 	this.close();
				// 	this.activeModal.close(this.presenation);
				// },
				// 	error => {
				// 		this.submitted = false;
				// 	});
			}


		} else {
			this.submitted = false;
		}

	}

	hasError(startMeetingForm: NgForm, field: string, validation: string) {
		if (startMeetingForm && Object.keys(startMeetingForm.form.controls).length > 0 && startMeetingForm.form.controls[field] &&
			startMeetingForm.form.controls[field].errors && validation in startMeetingForm.form.controls[field].errors) {
			if (validation) {
				return (startMeetingForm.form.controls[field].dirty &&
					startMeetingForm.form.controls[field].errors[validation]) || (this.edit && startMeetingForm.form.controls[field].errors[validation]);
			}
			return (startMeetingForm.form.controls[field].dirty &&
				startMeetingForm.form.controls[field].invalid) || (this.edit && startMeetingForm.form.controls[field].invalid);
		}
	}

	close() {
		this.submitted = false;
		this.edit = false;
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === true) {
			this.agendabindLabel = 'agenda_title_ar';
		} else {
			this.agendabindLabel = 'agenda_title_en';
		}
	}

}
