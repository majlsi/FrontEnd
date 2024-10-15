import {Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ViewChild, Input} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable} from 'rxjs';
import { NgForm } from '@angular/forms';

// Models
import { Attachment } from '../../../../core/models/attachment';
import { MeetingStatuses } from './../../../../core/models/enums/meeting-statuses';
import { AttachmentType } from '../../../../core/models/attachment-type';

// Services

import { UploadService } from '../../../../core/services/shared/upload.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { SharedAddSectionComponent } from '../../shared/shared-add-section/shared-add-section.component';
import { TranslationService } from '../../../../core/services/translation.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';

@Component({
	  selector: 'm-attachments',
	  templateUrl: './attachments.component.html',
	  changeDetection: ChangeDetectionStrategy.Default
})

 export class AttachmentsComponent implements OnInit {

    submitted: boolean = false;
    edit: boolean = false;
    files: Array<File>;
    attachmentsObs: Observable<any>;
	@Input() attachments: Array<Attachment> = [];
    attachmentsObsData: Observable<Attachment[]>;
    meetingId: number;
    filesOdsArray: Array<Observable<any>> = [];
    fileSizeError: string = '';
    fileTypeError: string = '';
    attachmentType = new AttachmentType();
    @Input() meetingStatusId: number;


    public disabled: boolean = false;


    @ViewChild(SharedAddSectionComponent) SharedAddSectionComponent?: SharedAddSectionComponent;
    @Output() tabChanged: EventEmitter<string> =   new EventEmitter();
    @Input() canEditMeeting: boolean;
    @Input() addRemoveLinkflag: boolean;
	meetingStatuses = MeetingStatuses;

	@Output() getMeetingEmitter = new EventEmitter();
    can_upload: boolean;
    isArabic: boolean;

    constructor(
        private route: ActivatedRoute, private router: Router,
        private _uploadService: UploadService,
        private _meetingService: MeetingService,
        private layoutUtilsService: LayoutUtilsService,
        private translationService: TranslationService) {

	}

	ngOnInit() {
        this.isArabic = this.translationService.isArabic();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.meetingId = +params['id']; // (+) converts string 'id' to a number
            }
        },
        error => {
            // console.log('error');
        });
	}

    save(attachmentForm: NgForm, previewMeeting: boolean = false) {
        this.submitted = true;
        this.edit = true;
        this.fileSizeError = '';
        this.fileTypeError = '';
        this.files = this.SharedAddSectionComponent.files;
        if (attachmentForm.valid && this.fileSizeError.length === 0 && this.fileTypeError.length === 0 ) {
            if (this.files.length !==  0)  {
                this.filesUploader(this.files);
                forkJoin([this.attachmentsObs]).subscribe(data => {
                    if (this.meetingId) { // if edit
                        const attachmentsLength = this.attachments.length ;
                        const attachmentsObject = [... this.attachments];
                        data[0].urls.forEach((url, index) => {
                            attachmentsObject[attachmentsLength + index] = new Attachment();
                            attachmentsObject[attachmentsLength + index].attachment_url = url;
                            attachmentsObject[attachmentsLength + index].attachment_name = this.files[index].name;
                        });
                        this._meetingService.setAttachmentsForMeeting<any>
                        (this.meetingId, {attachments: attachmentsObject}).subscribe(res => {
							this.submitted = false;
							this.getMeetingEmitter.emit();
                            if (previewMeeting) {
                                this.router.navigate(['/preview-meetings/' + res.meeting_version_id]);
                            } else {
                                this.tabChanged.emit('TAB5');
                            }
                        },
                        error => {
                            this.submitted = false;
                        });
                    }
                },  error => {
                    if (error && error.error[0]) {
                        if (this.isArabic) {
                            this.layoutUtilsService.showActionNotification(error.error[0][0].message_ar, MessageType.Delete);

                        } else {
                            this.layoutUtilsService.showActionNotification(error.error[0][0].message, MessageType.Delete);
                        }
                    }
                    this.submitted = false;
                });
            } else {
                this.submitted = false;
                if (this.meetingId) { // if edit
                    this._meetingService.setAttachmentsForMeeting<any>
                    (this.meetingId, {attachments: this.attachments}).subscribe(res => {
						this.submitted = false;
                        this.getMeetingEmitter.emit();
                        if (previewMeeting) {
                            // redirect to preview meeting
		                    this.router.navigate(['/preview-meetings/' + res.meeting_version_id]);
                        } else {
                            this.tabChanged.emit('TAB5');
                        }
                    },
                    error => {
                        this.submitted = false;
                    });
                }
            }
        } else {
            this.submitted = false;
        }
    }

    filesUploader(attachments: Array<File>) {
        if (attachments) {
          this.attachmentsObs = this._uploadService.uploadAttachments<File>(attachments);
        }
    }

    redirect() {
        this.router.navigate(['/meetings']);
    }

    saveMeetingVersion(attachmentForm: NgForm) {
        // save meeting attachments
        this.save(attachmentForm, true);
	}
}
