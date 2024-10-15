import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { attachment } from '../../../../core/config/attachment';
import { DropzoneComponent, DropzoneConfigInterface, DropzoneDirective } from 'ngx-dropzone-wrapper';
import { AttachmentType } from '../../../../core/models/attachment-type';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'm-shared-add-modal',
  templateUrl: './shared-add-modal.component.html',
})
export class SharedAddModalComponent implements OnInit {
  closeResult: string;
  submitted: boolean = false;
  edit: boolean = false;
  dropzone: any;
  fileSizeError: string = '';
  fileTypeError: string = '';
  public type: string = 'component';
  public disabled: boolean = false;
  attachmentType = new AttachmentType();

  config: DropzoneConfigInterface = {
    clickable: true,
    maxFilesize: 2000, // MB
    maxFiles: 5,
    autoReset: null,
    errorReset: null,
    cancelReset: null,
    addRemoveLinks: true, // This will show remove button
    acceptedFiles: '.jpeg,.jpg,.png,.pdf,.txt,.doc,.docx,.odt,.xls,.xlsx,.ppt,.pptx,.avi,.mov,.mp4,.wmv,.rtf'
  };

  @ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
  @ViewChild(DropzoneDirective) directiveRef?: DropzoneDirective;

  constructor(public activeModal: NgbActiveModal, private translate: TranslateService) { }

  ngOnInit() {
  }

  dropzoneHasFiles() {
    if (this.dropzone?.files.length === 0 && this.edit) {
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
  hasCountError() {
    return this.dropzone?.files.length > 5;
  }

  checkFilesSize() {
    this.dropzone?.files.forEach((file, index) => {
      if ((file.size / 1000) >= attachment.file_size) {
        // console.log('check');
        this.fileSizeError = this.translate.instant('FILES.File_SIZE_ERROR');
      } else if (file.size == 0) {
        this.fileSizeError = this.translate.instant('FILES.File_ZERO_SIZE_ERROR');
      }
      if (!this.attachmentType.filesType.includes(file.name.split('.').pop().toLocaleLowerCase())) {
        this.fileTypeError = this.translate.instant('FILES.File_TYPE_ERROR') + ': ';
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

  save(attachmentForm: NgForm) {
    this.submitted = true;
    this.edit = true;
    this.checkFilesSize();
    if (attachmentForm.valid && this.dropzone.files.length !== 0 && this.fileSizeError.length === 0 && this.fileTypeError.length == 0 && !this.hasCountError()) { // submit form if valid
      this.activeModal.close(this.dropzone.files);
    } else {
      this.submitted = false;
    }
  }


  onUploadInit(event) {
    this.dropzone = event;
  }

  onUploadError($event) {
    console.log($event);
  }
}
