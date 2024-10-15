 import { Component, Inject, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import { DropzoneComponent , DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { TranslateService } from '@ngx-translate/core';

// Models
import { MeetingStatuses } from '../../../../../core/models/enums/meeting-statuses';

// Services
import { UserService } from '../../../../../core/services/security/users.service';
import { TranslationService } from '../../../../../core/services/translation.service';
import { attachment } from '../../../../../core/config/attachment';

@Component({
	selector: 'm-add-mom-attachment',
	templateUrl: './add-attachment.component.html'
})

export class AddMomAttachmentComponent implements OnInit {

    closeResult: string;
    submitted: boolean = false;
    edit: boolean = false;
    dropzone: any;
    fileSizeError: string = '';

    public type: string = 'component';
    public disabled: boolean = false;

    public config: DropzoneConfigInterface = {
        clickable: true,
        maxFilesize: 2000, // MB
        autoReset: null,
        errorReset: null,
        cancelReset: null,
        addRemoveLinks: true, // This will show remove button
        acceptedFiles: '.jpeg,.jpg,.png,.pdf,.txt,.doc,.docx,.odt,.xls,.xlsx,.ppt,.pptx,.avi,.mov,.mp4,.wmv,.rtf'
    };

    @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
    @ViewChild(DropzoneDirective) directiveRef?: DropzoneDirective;
    @Output() AddMomAttachmentsEmiter = new EventEmitter();
    @Input() canEdit: boolean;
    meetingStatuses = MeetingStatuses;

    constructor(private modalService: NgbModal, private _userService: UserService,
        private _translationService: TranslationService,
        private translate: TranslateService) { }

	ngOnInit() {
    }

	open(content) {

        this.modalService.open(content, { size: 'xl' as 'lg' }).result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
	}

	private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    dropzoneHasFiles() {
        if (this.dropzone.files.length === 0  && this.edit) {
            return true;
        } else {
            return false;
        }
    }

    hasFileSizeError() {
        this.fileSizeError = '';
        this.checkFilesSize();
        if (this.fileSizeError.length !== 0) {
            return true;
        } else {
            return false;
        }
    }

    checkFilesSize() {
        this.dropzone.files.forEach((file , index) => {
            if ((file.size / 1000) >= attachment.file_size) {
                this.fileSizeError = this.translate.instant('MEETINGS.ATTACHMENTS.VALIDATION.File_SIZE_ERROR');
            }
        });
    }

    save(attachmentForm: NgForm) {
        this.submitted = true;
        this.edit = true;
        this.checkFilesSize();
        if (attachmentForm.valid && this.dropzone.files.length !== 0 && this.fileSizeError.length === 0) { // submit form if valid
            this.AddMomAttachmentsEmiter.emit(this.dropzone.files);
            this.close();
        } else {
            this.submitted = false;
        }
    }


    close () {
        this.submitted = false;
        this.edit = false;
    }

    onUploadInit(event) {
        this.dropzone = event;
    }
}
