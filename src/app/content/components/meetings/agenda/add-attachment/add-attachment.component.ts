import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import {
    DropzoneComponent, DropzoneDirective,
    DropzoneConfigInterface
} from 'ngx-dropzone-wrapper';
import { TranslateService } from '@ngx-translate/core';

// Models
import { MeetingStatuses } from '../../../../../core/models/enums/meeting-statuses';

// Services
import { TranslationService } from '../../../../../core/services/translation.service';
import { attachment } from '../../../../../core/config/attachment';
import { AttachmentType } from '../../../../../core/models/attachment-type';
import { SharedSelectModalComponent } from '../../../shared/shared-select-modal/shared-select-modal.component';
import { SharedAddModalComponent } from '../../../shared/shared-add-modal/shared-add-modal.component';
import { FileService } from '../../../../../core/services/files/file.service';


@Component({
    selector: 'm-add-attachment',
    templateUrl: './add-attachment.component.html'
})

export class AddAttachmentComponent implements OnInit {

    isArabic: boolean;
    closeResult: string;
    submitted: boolean = false;
    edit: boolean = false;
    dropzone: any;
    fileSizeError: string = '';
    fileTypeError: string = '';
    public type: string = 'component';
    public disabled: boolean = false;
    attachmentType = new AttachmentType();

    public config: DropzoneConfigInterface = {
        clickable: true,
        maxFilesize: 10, // MB
        autoReset: null,
        errorReset: null,
        cancelReset: null,
        addRemoveLinks: true, // This will show remove button
        acceptedFiles: '.jpeg,.jpg,.png,.pdf,.txt,.doc,.docx,.odt,.xls,.xlsx,.ppt,.pptx,.avi,.mov,.mp4,.wmv,.rtf'
    };

    @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
    @ViewChild(DropzoneDirective) directiveRef?: DropzoneDirective;
    @Output() AddAgendaAttachmentsEmiter = new EventEmitter();
    @Input() canEdit: boolean;
    @Input() attachments;
    @Input() can_upload: boolean;
    meetingStatuses = MeetingStatuses;

    constructor(private modalService: NgbModal,
        private translate: TranslateService, private translationService : TranslationService
        ) { }

    ngOnInit() {
        this.isArabic = this.translationService.isArabic();

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
        if (this.dropzone.files.length === 0 && this.edit) {
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

    hasFileTypeError() {
        this.fileTypeError = '';
        this.checkFilesSize();
        if (this.fileTypeError.length !== 0) {
            return true;
        } else {
            return false;
        }
    }

    checkFilesSize() {
        this.dropzone.files.forEach((file, index) => {
            if ((file.size / 1000) >= attachment.file_size) {
                this.fileSizeError = this.translate.instant('MEETINGS.ATTACHMENTS.VALIDATION.File_SIZE_ERROR');
            } else if (file.size == 0) {
                this.fileSizeError = this.translate.instant('MEETINGS.ATTACHMENTS.VALIDATION.File_ZERO_SIZE_ERROR');
            }
            if (!this.attachmentType.filesType.includes(file.name.split('.').pop().toLocaleLowerCase())) {
                this.fileTypeError = this.translate.instant('MEETINGS.ATTACHMENTS.VALIDATION.File_TYPE_ERROR') + ': ';
                // tslint:disable-next-line:no-shadowed-variable
                this.attachmentType.filesType.forEach((extension, index) => {
                    if (index === (this.attachmentType.filesType.length - 1)) {
                        this.fileTypeError += ' ' + extension;
                    } else {
                        this.fileTypeError += ' ' + extension + ',';
                    }
                });
            }
        });
    }

    close() {
        this.submitted = false;
        this.edit = false;
    }

    onUploadInit(event) {
        this.dropzone = event;
    }

    selectFileModal($event) {
        $event.preventDefault();

        const modalRef = this.modalService.open(SharedSelectModalComponent, { windowClass: 'modal-615', centered: true, keyboard: false });
        modalRef.result.then(result => {
            if (result) {
                const mappedResults = result.map(a => {
                    return {
                        file_id: a.id,
                        attachment_url: a.file_path,
                        attachment_name: a.file_name + '.' + a.file_type.file_type_ext,
                        is_external_storage: true
                    };
                });
                this.attachments.push(...mappedResults);
            }
        }, (reason) => {
        });
    }
    addFileModal($event) {
        $event.preventDefault();
        const modalRef = this.modalService.open(SharedAddModalComponent, { windowClass: 'modal-615', centered: true, keyboard: false });
        modalRef.result.then(result => {
            if (result) {
                this.AddAgendaAttachmentsEmiter.emit(result);
            }
        }, (reason) => { });
    }

}
