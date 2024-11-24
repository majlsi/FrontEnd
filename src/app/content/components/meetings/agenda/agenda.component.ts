import {Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ViewChild, Input, OnDestroy} from '@angular/core';
import {Params, ActivatedRoute, Router} from '@angular/router';
import {forkJoin, Observable, of, BehaviorSubject} from 'rxjs';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

// Models
import {AgendaPurpose} from '../../../../core/models/agenda-purpose';
import {MeetingAgenda} from '../../../../core/models/meeting-agenda';
import {User} from '../../../../core/models/user';
import {Attachment} from '../../../../core/models/attachment';
import {MeetingStatuses} from './../../../../core/models/enums/meeting-statuses';

// Services
import {TranslationService} from '../../../../core/services/translation.service';
import {MeetingService} from '../../../../core/services/meeting/meeting.service';
import {LayoutUtilsService, MessageType} from '../../../../core/services/layout-utils.service';
import {UploadService} from '../../../../core/services/shared/upload.service';
import {AgendaTemplate} from '../../../../core/models/agenda-template';
import {DragulaService} from 'ng2-dragula';
import {DragulaOptions} from 'dragula';
import {FileService} from '../../../../core/services/files/file.service';
import {AgendaParticipant} from '../../../../core/models/agenda-participant';
import {AgendaPresenter} from '../../../../core/models/agenda-presenter';

@Component({
	selector: 'm-agenda',
	templateUrl: './agenda.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class AgendaComponent implements OnInit, OnDestroy {

	@Input() agendaPurposes: Array<AgendaPurpose> = [];
	@Input() agendaTemplates: Array<AgendaTemplate> = [];
	edit: boolean = false;
	submitted: boolean = false;
	meetingId: number;
	agendaPurposeBindLabel: string = 'purpose_name_en';
	agendaTemplatebindLabel: string = 'agenda_template_name_en';
	agendaPresentersbindLabel: string = 'name';
	@Input() participants: Array<User> = [];
	presentersObs: Observable<User[]>;
	attachmentsObs: Array<Observable<any>> = [];
	startIndex: number = 0;

	isArabic: boolean = false;

	@Input() agendas: Array<MeetingAgenda> = [];

	errors: Array<String> = [];

	@Output() tabChanged: EventEmitter<string> = new EventEmitter();
	@Input() canEditMeeting: boolean;
	@Input() meetingStatusId: number;
	meetingStatuses = MeetingStatuses;
	@Output() getMeetingEmitter = new EventEmitter();
	@Output() updateAgendaEmitter = new EventEmitter();
	can_upload: boolean;

	constructor(
		private route: ActivatedRoute, private router: Router,
		private _translationService: TranslationService,
		private _meetingService: MeetingService,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService,
		private _uploadService: UploadService,
		private dragula: DragulaService,
		private fileService: FileService) {
	}

	ngOnDestroy(): void {
		this.dragula.destroy('agendas');
	}


	ngOnInit() {
		this.getLanguage();
		this.fileService.quotaObservable().subscribe(res => {
			this.can_upload = !res.has_exceeded_quota;
		});
		this.fileService.reloadStorageQuota();
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.meetingId = +params['id'];
			}
			if (this.canEditMeeting === false) {
				this.dragula.createGroup('agendas', {
					moves: (el, container, handle, sibling) => false
				});
			}
		});
	}

	getParticipantsLabel(participant: any) {
		let name = '';
		if (!participant?.meeting_guest_id && participant.id) {
			// user
			let index = this.participants.findIndex(p => p.id == participant.id && !p.isGuest);
			if (index > -1) {
				const selected = this.participants[index];
				name = (this.isArabic ? (selected.name_ar ? selected.name_ar : selected.name) :
					(selected.name ? selected.name : selected.name_ar));
			}
		} else if (participant?.meeting_guest_id && !participant.id) {
			// Guest
			const index = this.participants.findIndex(p => p.meeting_guest_id == participant.meeting_guest_id && p.isGuest);
			if (index > -1) {
				name = this.participants[index]?.email;
			}
		}
		return name;
	}

	getPresentersLabel(participant: any) {
		let name = '';
		if (!participant?.meeting_guest_id && participant.user_id) {
			// user
			const index = this.participants.findIndex(p => p.id == participant.user_id && !p.isGuest);
			if (index > -1) {
				const selected = this.participants[index];
				name = (this.isArabic ? (selected.name_ar ? selected.name_ar : selected.name) :
					(selected.name ? selected.name : selected.name_ar));
			}
		} else if (participant?.meeting_guest_id && !participant.user_id) {
			// Guest
			const index = this.participants.findIndex(p => p.meeting_guest_id == participant.meeting_guest_id && p.isGuest);
			if (index > -1) {
				name = this.participants[index]?.email;
			}
		}
		return name;
	}

	getParticipantValue(participant: any, agendaId) {
		const value: AgendaParticipant = {
			meeting_guest_id: participant.isGuest ? participant.meeting_guest_id : null,
			user_id: participant.isGuest ? null : participant.id,
			meeting_agenda_id: agendaId
		};
		return value;
	}

	compareFn(option1: AgendaParticipant | AgendaPresenter, option2: AgendaParticipant | AgendaPresenter): boolean {
		if (option1 && option2) {
			return (option1?.user_id && option2?.user_id && option1?.user_id === option2?.user_id)
				|| (option1?.meeting_guest_id && option2?.meeting_guest_id && option1?.meeting_guest_id === option2?.meeting_guest_id);
		} else {
			return option1 === option2;
		}
	}

	presenterExists(participantsList, presenter) {
		let found = false;
		participantsList.forEach(participant => {
			if (this.compareFn(participant, presenter)) {
				found = true;
			}
		});
		return found;
	}

	participantsChanged(participantsList: Array<AgendaParticipant>, agenda: MeetingAgenda) {
		if (participantsList.length === 0) {
			agenda.presenters = [];
			return;
		}

		agenda.presenters = agenda.presenters?.filter(p => {
			return this.presenterExists(participantsList, p);
		});
	}

	hasError(agendaPurposeForm: NgForm, field: string, validation: string) {
		if (agendaPurposeForm && Object.keys(agendaPurposeForm.form.controls).length > 0 && agendaPurposeForm.form.controls[field] &&
			agendaPurposeForm.form.controls[field].errors && validation in agendaPurposeForm.form.controls[field].errors) {
			if (validation) {
				return (agendaPurposeForm.form.controls[field].dirty &&
					agendaPurposeForm.form.controls[field].errors[validation]) || (this.edit && agendaPurposeForm.form.controls[field].errors[validation]);
			}
			return (agendaPurposeForm.form.controls[field].dirty &&
				agendaPurposeForm.form.controls[field].invalid) || (this.edit && agendaPurposeForm.form.controls[field].invalid);
		}
	}

	removeAgenda(agendaIndex) {
		const _title: string = this.translate.instant('MEETINGS.AGENDA.DELETE.DELETEAGENDA');
		const _description: string = this.translate.instant('MEETINGS.AGENDA.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.AGENDA.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGS.AGENDA.DELETE.DELETEMESSAGE');
		const _errorMessage = this.translate.instant('MEETINGS.AGENDA.DELETE.ERRORMESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description,
			_waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (this.agendas[agendaIndex].id > 0) {
				this._meetingService.deleteMeetingAgenda<MeetingAgenda>(this.meetingId, this.agendas[agendaIndex].id).
				subscribe(pagedData => {
						this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
						this.agendas.splice(agendaIndex, 1);
					},
					error => {
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);
						} else {
							this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);
						}
					});
			} else {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.agendas.splice(agendaIndex, 1);
			}
			this.updateAgendaEmitter.emit();
		});
	}

	save(agendaPurposeForm: NgForm, previewMeeting: boolean = false) {
		this.submitted = true;
		this.edit = true;
		this.errors = [];
		const agendasHaveDescriptionLenthError = this.agendas.filter(function (agenda) {
			return (agenda.agenda_description_ar && agenda.agenda_description_ar.length >= 1000) ||
				(agenda.agenda_description_en && agenda.agenda_description_en.length >= 1000);
		});
		const agendasHaveMaxAttachmentsNumberError = this.agendas.filter(function (agenda) {
			return ((agenda.agenda_attachments ? agenda.agenda_attachments.length : 0) + (agenda.files ? agenda.files.length : 0)) > 5;
		});
		if (agendaPurposeForm.valid && agendasHaveDescriptionLenthError.length === 0 && agendasHaveMaxAttachmentsNumberError.length === 0) {
			if (this.meetingId) { // if edit
				this.agendas.forEach((agenda, index) => {
					agenda.agenda_order = index + 1;
					if (agenda.id < 0) {
						agenda.id = undefined;
					}
					this.filesUploader(agenda.files, index);
				});
				if (this.attachmentsObs.length === 0) {
					this.updateAgendas(previewMeeting);
				} else {
					forkJoin(this.attachmentsObs).subscribe(data => {
						this.agendas.forEach((agenda, index) => {
							if (agenda.files && agenda.files.length !== 0) {
								const attachmentsLength = this.agendas[index].agenda_attachments.length;
								this.agendas[index].attachments = this.agendas[index].agenda_attachments;
								data[this.startIndex].urls.forEach((url, key) => {
									this.agendas[index].attachments[attachmentsLength + key] = new Attachment();
									this.agendas[index].attachments[attachmentsLength + key].attachment_url = url;
									this.agendas[index].attachments[attachmentsLength + key].attachment_name = this.agendas[index].files[key].name;
								});
								++this.startIndex;
							}
							delete this.agendas[index].files;
						});
						this.updateAgendas(previewMeeting);
					}, error => {
						if (error && error.error[0]) {
							if (this.isArabic) {
								this.layoutUtilsService.showActionNotification(error.error[0][0].message_ar, MessageType.Delete);

							} else {
								this.layoutUtilsService.showActionNotification(error.error[0][0].message, MessageType.Delete);
							}
						}
						this.submitted = false;
					});
				}
			}
		} else {
			this.submitted = false;
		}

	}

	updateAgendas(previewMeeting) {
		this.agendas.forEach((agenda, index) => {
			if (!this.agendas[index].attachments || this.agendas[index].attachments.length == 0) {
				this.agendas[index].attachments = this.agendas[index].agenda_attachments;
			}
		});
		let result: any;
		this._meetingService.setMeetingAgendasForMeeting<any>(this.meetingId, this.agendas).subscribe({
			next: (res) => {
				result = res;
				this.submitted = false;
			},
			error: (error) => {
				this.submitted = false;
				this.errors = error.error[0];
			},
			complete: () => {
				this.getMeetingEmitter.emit();
				if (previewMeeting) {
					// redirect to preview meeting
					this.router.navigate(['/preview-meetings/' + result.meeting_version_id]);
				} else {
					this.tabChanged.emit('TAB6');
				}
			}
		});
	}

	appendNewAgenda() {
		const newAgenda = new MeetingAgenda();
		newAgenda.meeting_id = this.meetingId;
		newAgenda.agenda_presenters = [];
		newAgenda.agenda_attachments = [];
		newAgenda.agenda_order = this.agendas.length;
		newAgenda.id = this.agendas.length * -1;

		this.agendas.push(newAgenda);
	}

	autoFillDesc(agenda, agendaTemplateId) {
		const selectedAgendaTemplate = this.agendaTemplates.filter(function (item) {
			return item.id === agendaTemplateId;
		});

		if (selectedAgendaTemplate.length > 0) {
			agenda.agenda_description_ar = selectedAgendaTemplate[0].agenda_description_template_ar;
			agenda.agenda_description_en = selectedAgendaTemplate[0].agenda_description_template_en;

		} else {
			agenda.agenda_description_ar = null;
			agenda.agenda_description_en = null;
		}
	}


	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === true) {
			this.agendaPurposeBindLabel = 'purpose_name_ar';
			this.agendaPresentersbindLabel = 'name_ar';
			this.agendaTemplatebindLabel = 'agenda_template_name_ar';
		}
	}

	addAgendaAttachments(data, agendaIndex) {
		if (!this.agendas[agendaIndex].files) {
			this.agendas[agendaIndex].files = [];
		}
		this.agendas[agendaIndex].files = this.agendas[agendaIndex].files.concat(data);
	}

	deleteAttachment(agendaIndex, attachmentIndex) {
		this.deleteAttachmentAlert(agendaIndex, attachmentIndex, 'agendaAttachment');
	}

	deleteFile(agendaIndex, fileIndex) {
		this.deleteAttachmentAlert(agendaIndex, fileIndex, 'dropzoneFile');
	}

	deleteAttachmentAlert(agendaIndex, attachmentIndex, fileType) {
		const _title: string = this.translate.instant('MEETINGS.AGENDA.DELETE.DELETE_AGENDA_ATTACHMENT');
		const _description: string = this.translate.instant('MEETINGS.AGENDA.DELETE.DESCRIPTION_AGENDA_ATTACHMENT');
		const _waitDesciption: string = this.translate.instant('MEETINGS.AGENDA.DELETE.WAITDESCRIPTION_AGENDA_ATTACHMENT');
		const _deleteMessage = this.translate.instant('MEETINGS.AGENDA.DELETE.DELETEMESSAGE_AGENDA_ATTACHMENT');
		const _errorMessage = this.translate.instant('MEETINGS.AGENDA.DELETE.ERRORMESSAGE_AGENDA_ATTACHMENT');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description,
			_waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (fileType !== 'dropzoneFile') {
				if (this.agendas[agendaIndex].agenda_attachments[attachmentIndex].id > 0) {
					this._meetingService.deleteAgendaAttachment<Attachment>(this.meetingId, this.agendas[agendaIndex].id,
						this.agendas[agendaIndex].agenda_attachments[attachmentIndex].id).subscribe(pagedData => {
							this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
							this.agendas[agendaIndex].agenda_attachments.splice(attachmentIndex, 1);
						},
						error => {
							this.layoutUtilsService.showActionNotification(_errorMessage, MessageType.Delete);
						});
				} else {
					this.agendas[agendaIndex].agenda_attachments.splice(attachmentIndex, 1);
				}

			} else {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.agendas[agendaIndex].files.splice(attachmentIndex, 1);
				if (this.agendas[agendaIndex].files.length === 0) {
					delete this.agendas[agendaIndex].files;
				}
			}
		});
	}

	trackAttachment(index: number, item: MeetingAgenda) {
		return index;
	}

	trackFile(index: number, item: MeetingAgenda) {
		return index;
	}

	filesUploader(agendaFiles, agendaIndex) {
		if (agendaFiles) {
			this.attachmentsObs.push(this._uploadService.uploadAttachments<File>(agendaFiles));
		}
	}

	trackFunction(index: number, item: MeetingAgenda) {
		return item.id;
	}

	redirect() {
		this.router.navigate(['/meetings']);
	}

	saveMeetingVersion(agendaPurposeForm: NgForm) {
		// save meeting agendas
		this.save(agendaPurposeForm, true);
	}
}
