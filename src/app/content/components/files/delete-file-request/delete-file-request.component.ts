import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin } from 'rxjs';
import { attachment } from '../../../../core/config/attachment';
import { AdminRequest } from '../../../../core/models/admin-request';
import { Committee } from '../../../../core/models/committee';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { FileService } from '../../../../core/services/files/file.service';


@Component({
  selector: 'default-delete-file-request',
  templateUrl: './delete-file-request.component.html',
  styleUrls: []
})
export class DeleteFileRequestComponent implements OnInit {

  reason: any;
  submitted: boolean = false;
  edit: boolean = false;
  closeResult: string;
  @Input() fileId: number;
  attachmentUrl: string;
  attachmentTypeError: boolean = false;
  attachmentExtensions: Array<String> = ['jpeg', 'jpg', 'png', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];
  attachmentSizeError: string = '';
  attachmentChangedEvent: any;
  uploadAttachmentsObs: Observable<any>;
  request: AdminRequest = new AdminRequest();

  constructor(
    private _ngbActiveModal: NgbActiveModal,
    private _fileService: FileService,
    private translate: TranslateService,
    private _uploadService: UploadService
  ) { }

  ngOnInit(): void { }

  validateFile() {
    this.attachmentSizeError = '';
    const fileSize = this.attachmentChangedEvent ? (this.attachmentChangedEvent.size / 1000) : 0;
    if (fileSize > attachment.file_size) {
      this.attachmentSizeError = this.translate.instant('COMMITTEES.VALIDATION.File_SIZE_ERROR');
    } else if (fileSize === 0 && this.attachmentChangedEvent) {
      this.attachmentSizeError = this.translate.instant('COMMITTEES.VALIDATION.File_ZERO_SIZE_ERROR');
    }
  }

  uploadAttachments(file: File) {
    if (file) {
      this.uploadAttachmentsObs = this._uploadService.uploadEvidenceDocument<File>(file);
    }
  }

  save(memberForm: NgForm) {
    this.submitted = true;
    this.edit = true;
    this.validateFile();
    if (memberForm.valid && !this.attachmentTypeError && this.attachmentSizeError.length === 0) { // submit form if valid

      if (this.attachmentChangedEvent) {
        this.uploadAttachments(this.attachmentChangedEvent);
        forkJoin(this.uploadAttachmentsObs).subscribe(data => {
          this.request.evidence_document_url = data[0].url;
          this.unfreezeRequest();
        }, error => {
          this.submitted = false;
        });
      } else {
        this.unfreezeRequest();
      }
    } else {
      this.submitted = false;
    }
  }

  unfreezeRequest() {
    this.request.request_body = {
      file_id: this.fileId,
      reason: this.reason
    };
    this._fileService.deleteFileRequest(this.request).subscribe(
      res => {
        this.close(res);
      }, err => {
        this.submitted = false;
      }
    );
  }

  close(res) {
    this.submitted = false;
    this.edit = false;
    this._ngbActiveModal.close(res);
  }

  dismiss() {
    this.submitted = false;
    this.edit = false;
    this._ngbActiveModal.dismiss();
  }


  hasError(committeeForm: NgForm, field: string, validation: string) {
    if (committeeForm && Object.keys(committeeForm.form.controls).length > 0 &&
      committeeForm.form.controls[field].errors && validation in committeeForm.form.controls[field].errors) {
      if (validation) {
        return (committeeForm.form.controls[field].dirty &&
          committeeForm.form.controls[field].errors[validation]) || (this.edit && committeeForm.form.controls[field].errors[validation]);
      }
      return (committeeForm.form.controls[field].dirty &&
        committeeForm.form.controls[field].invalid) || (this.edit && committeeForm.form.controls[field].invalid);
    }
  }

  fileChangeEvent(event: any): void {
    this.attachmentSizeError = '';
    this.attachmentTypeError = false;
    if (event.target.files[0]) {
      const extension = event.target.files[0].name.split('.');
      this.attachmentChangedEvent = event.target.files[0];
      this.attachmentUrl = event.target.files[0].name;
      this.attachmentTypeError = (this.attachmentExtensions.includes(extension[extension.length - 1].toLowerCase())) ? false : true;
    } else {
      this.attachmentUrl = null;
      this.attachmentChangedEvent = null;
    }
  }
}
