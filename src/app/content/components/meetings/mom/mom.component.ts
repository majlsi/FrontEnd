
import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { NgForm } from '@angular/forms';

// Models
import { MeetingAgenda } from '../../../../core/models/meeting-agenda';
import { MinOfMeeting } from './../../../../core/models/min-of-meeting';
import { MeetingStatuses } from './../../../../core/models/enums/meeting-statuses';

// Services
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { HtmlMomTemplate } from '../../../../core/models/html-mom-template';
import { Meeting } from '../../../../core/models/meeting';
import { MomTemplate } from '../../../../core/models/mom-template';
import { JoditEditor } from '../../../../core/config/jodit-editor';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { environment } from '../../../../../environments/environment';

@Component({
	selector: 'm-mom',
	templateUrl: './mom.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class MOMComponent implements OnInit {

	submitted: boolean = false;
	edit: boolean = false;
	bool;

	meetingId: number;
	@Input() agendas: Array<MeetingAgenda> = [];
	@Input() is_mom_sent: boolean = true;
	@Input() is_signature_sent: boolean = true;
	@Input() momSummaryTemplates: Array<HtmlMomTemplate> = [];
	isArabic: boolean = false;
	@Input() meeting = new Meeting();
	@Input() momTemplates: Array<MomTemplate> = [];
	agendabindLabel: string;
	htmlTemplatebindLabel: string;
	attachmentsObs: Array<Observable<any>> = [];
	startIndex: number = 0;
	lang: string;
	editorConfig: any = {};
	momTemplateView: string = '';
	@Output() tabChanged: EventEmitter<string> = new EventEmitter();
	@Input() canEditMeeting: boolean;
	meetingStatuses = MeetingStatuses;
	@Output() getMeetingEmitter = new EventEmitter();
	momTemplatelBindLabel = 'template_name_en';
	@Input() hideAddCancel: boolean = false;
	meetingMom: any;
	meetingDataObs: Observable<any>;
	documentSizeError: string;
	fileTypeError: boolean;
	documentUrl: any;
	docuemntChangedEvent: any;

	constructor(
		private route: ActivatedRoute, private router: Router,
		private _translationService: TranslationService,
		private meetingService: MeetingService,
		private translate: TranslateService,
		private crudService: CrudService,
		private layoutUtilsService: LayoutUtilsService,
		private uploadService: UploadService) {
	}

	ngOnInit() {
		this.getLanguage();
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.meetingId = +params['id'];
				this.getMeeting();
				forkJoin([this.meetingDataObs]).subscribe(
					data => {
						this.is_mom_sent = data[0].is_mom_sent;
						this.is_signature_sent = data[0].is_signature_sent;
						this.meeting.is_mom_pdf = data[0].is_mom_pdf;
						this.meeting.mom_pdf_url = data[0].mom_pdf_url;
						this.meeting.mom_pdf_file_name = data[0].mom_pdf_file_name;

						this.setEditorConfig();
						this.getMeetingMom();
					}, error => {
					});
			}
		});
	}

	getMeeting() {
		this.meetingDataObs = this.crudService.get<Meeting>('admin/meetings', this.meetingId);
	}

	save(momForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		if (momForm.valid) {
			if (this.meetingId) { // if edit
				if (this.meeting.is_mom_pdf) {
					if (this.docuemntChangedEvent != null) {
						if (!this.fileTypeError) {
							this.uploadService.uploadMomPdf<File>(this.docuemntChangedEvent).subscribe(res => {
								this.meeting.mom_pdf_url = res.url;
								this.meeting.mom_pdf_file_name = this.docuemntChangedEvent.name;
								this.updateMeeting();
							}, error => {
								this.documentSizeError = this.translate.instant('REVIEWS_ROOM.VALIDATION.SIZE_ERROR');
								this.submitted = false;
							});
						}
					} else {
						this.updateMeeting();
					}
				} else {
					if (this.attachmentsObs.length === 0) {
						this.updatemoms();
					} else {
						forkJoin(this.attachmentsObs).subscribe(data => {

							this.updatemoms();
						}, error => {
							this.submitted = false;
						});
					}
				}

			}
		} else {
			this.submitted = false;
		}

	}


	private updateMeeting() {
		this.meetingService.changeMomPdf(this.meeting.id, this.meeting)
			.subscribe(res => {
				this.submitted = false;
				this.edit = false;
				this.getMeetingEmitter.emit();
				this.tabChanged.emit('TAB1');
				this.fileTypeError = null;
			}, error => {
				this.submitted = false;
				this.fileTypeError = null;
			});
	}

	updatemoms() {
		this.meetingMom.mom_summary = this.momTemplateView;
		this.meetingService.setMeetingMom<any>(this.meetingId, { 'mom_template_id': this.meeting.meeting_mom_template_id, mom: this.meetingMom }).subscribe(res => {
			// this.updateMeeting();
			this.submitted = false;
			this.edit = false;
		},
			error => {
				this.submitted = false;
			});
	}

	trackAttachment(index: number, item: MinOfMeeting) {
		return index;
	}

	trackFunction(index: number, item: MinOfMeeting) {
		return index;
	}

	trackFile(index: number, item: MinOfMeeting) {
		return index;
	}

	hasError(momForm: NgForm, field: string, validation: string) {
		if (momForm && Object.keys(momForm.form.controls).length > 0 && momForm.form.controls[field] &&
			momForm.form.controls[field].errors && validation in momForm.form.controls[field].errors) {
			if (validation) {
				return (momForm.form.controls[field].dirty &&
					momForm.form.controls[field].errors[validation]) || (this.edit && momForm.form.controls[field].errors[validation]);
			}
			return (momForm.form.controls[field].dirty &&
				momForm.form.controls[field].invalid) || (this.edit && momForm.form.controls[field].invalid);
		}
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === true) {
			this.lang = 'ar';
			this.agendabindLabel = 'agenda_title_ar';
			this.htmlTemplatebindLabel = 'html_mom_template_name_ar';
			this.momTemplatelBindLabel = 'template_name_ar';
		} else {
			this.lang = 'en';
			this.agendabindLabel = 'agenda_title_en';
			this.htmlTemplatebindLabel = 'html_mom_template_name_en';
			this.momTemplatelBindLabel = 'template_name_en';
		}
	}

	redirect() {
		this.router.navigate(['/meetings']);
	}

	downloadMomAsPdf() {
		const langId = this.isArabic ? 1 : 2;
		this.meetingService.previewMom(this.meetingId, langId).subscribe((result) => {
			const downloadURL = window.URL.createObjectURL(result);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download =
				(this.isArabic ? (this.meeting.meeting_title_ar ? this.meeting.meeting_title_ar : this.meeting.meeting_title_en) : (this.meeting.meeting_title_en ? this.meeting.meeting_title_en : this.meeting.meeting_title_ar)) + '.pdf';
			link.click();
		}, error => {
			this.layoutUtilsService.showActionNotification(this.translate.instant('MEETINGS.MOM.PREVIEW.ERROR'), MessageType.Delete);
		});
	}


	getMeetingMom() {
		this.meetingService.getMeetingMom<any>(this.meetingId).subscribe(res => {
			this.meetingMom = res;
			this.momTemplateView = res.mom_summary;
		}, error => {
		});
	}

	onChange(event) {
		// if(event.target){
		// 	this.meetingMom.mom_summary = event.target.value;
		// }
	}

	updateMomTemplate(momTemplate) {
		this.meetingService.getMomTemplate<any>(this.meetingId, momTemplate.id).subscribe(res => {
			this.meetingMom.mom_summary = res.mom_summary;
			this.meetingMom.language_id = res.language_id;
			this.momTemplateView = res.mom_summary;
		});
	}

	setEditorConfig() {
		this.editorConfig = JoditEditor;
		this.editorConfig.language = this.isArabic ? 'ar' : 'en';
		this.editorConfig.readonly = this.is_signature_sent ? true : false;
	}

	dipalyError() {
		this.layoutUtilsService.showActionNotification(this.translate.instant('MOM_TEMPLATE_PAGE.IMAGE_INVALID'), MessageType.Delete);
	}

	downloadOriginalFile() {
		this.downloadFile(environment.imagesBaseURL + this.meeting.mom_pdf_url, this.meeting.mom_pdf_file_name);
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
	fileChangeEvent(event: any): void {
		this.documentSizeError = '';
		this.fileTypeError = false;
		if (event.target.files[0]) {
			const extension = event.target.files[0].name.split('.');
			this.fileTypeError = ('pdf' == extension[extension.length - 1].toLowerCase()) ? false : true;
			if (!this.fileTypeError) {
				this.docuemntChangedEvent = event.target.files[0];
				this.documentUrl = event.target.files[0].name;
			}
		} else {
			this.documentUrl = null;
			this.docuemntChangedEvent = null;
		}

	}
}
