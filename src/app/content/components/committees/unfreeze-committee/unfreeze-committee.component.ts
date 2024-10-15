import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminRequest } from '../../../../core/models/admin-request';
import { Committee } from '../../../../core/models/committee';
import { AdminRequestTypes } from '../../../../core/models/enums/admin-request-types';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { attachment } from '../../../../core/config/attachment';
import { Observable, forkJoin } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { UploadService } from '../../../../core/services/shared/upload.service';

@Component({
  selector: 'default-unfreeze-committee',
  templateUrl: './unfreeze-committee.component.html',
  styleUrls: []
})
export class UnfreezeCommitteeComponent implements OnInit {
  startDateModel: any;
  expiredDateModel: any;
  reason: any;
  isDateError: boolean = false;
  submitted: boolean = false;
  edit: boolean = false;
  closeResult: string;
  @Input() committee: Committee;
  attachmentUrl: string;
  attachmentTypeError: boolean = false;
  attachmentExtensions: Array<String> = ['jpeg', 'jpg', 'png', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];
  attachmentSizeError: string = '';
  attachmentChangedEvent: any;
  uploadAttachmentsObs: Observable<any>;
  request: AdminRequest = new AdminRequest();

  constructor(
    private _ngbActiveModal: NgbActiveModal,
    private _committeeService: CommitteeService,
    private translate: TranslateService,
    private _uploadService: UploadService
  ) { }

  ngOnInit(): void { }


  setEndDateEqualFrom() {
    if (this.expiredDateModel?.year && this.expiredDateModel?.month && this.expiredDateModel?.day &&
      this.startDateModel?.year && this.startDateModel?.month && this.startDateModel?.day) {
      const startDate = new Date(this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day);
      const endDate = new Date(this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day);
      if (startDate > endDate) {
        this.expiredDateModel = this.startDateModel;
      }
      this.isDateError = false;
    }
  }

  validateDates() {
    if (this.expiredDateModel && this.startDateModel) {
      let startDate;
      let endDate;
      startDate = new Date(this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day);
      endDate = new Date(this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day);
      let today = new Date();
      today = new Date(today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate());
      if (startDate > endDate || endDate < today) {
        this.isDateError = true;
      } else {
        this.isDateError = false;
      }
    }
  }

  decideClosure(event, datepicker) {
    const path = event.composedPath().map(p => p.localName);
    if (!path.includes('ngb-datepicker')) {
      datepicker.close();
    }
  }

  validateFile() {
    this.attachmentSizeError = '';
    const fileSize = this.attachmentChangedEvent ? (this.attachmentChangedEvent.size / 1000) : 0;
    if (fileSize > attachment.file_size) {
      this.attachmentSizeError = this.translate.instant('COMMITTEES.VALIDATION.File_SIZE_ERROR');
    } else if (fileSize == 0 && this.attachmentChangedEvent) {
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
    if (memberForm.valid && !this.isDateError
      && !this.attachmentTypeError && this.attachmentSizeError.length == 0) { // submit form if valid

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
    // this.formatDate('string');
    this.request.request_body = {
      id: this.committee.id,
      reason: this.reason,
      committee_start_date:this.committee.committee_start_date,
      committee_expired_date:this.committee.committee_expired_date
    };
    this._committeeService.unFreezeCommitteesRequest(this.request).subscribe(
      res => {
        this.close(res);
      }, err => {
        this.submitted = false;
      }
    );
  }

  formatDate(type) {
    if (type == 'object') {
      if (this.committee?.committee_start_date) {
        const startDate = new Date(this.committee.committee_start_date);
        this.startDateModel = { day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear() };
      }
      if (this.committee?.committee_expired_date) {
        const endDate = new Date(this.committee.committee_expired_date);
        this.expiredDateModel = { day: endDate.getDate(), month: endDate.getMonth() + 1, year: endDate.getFullYear() };
      }
    } else {
      if (this.startDateModel) {
        this.committee.committee_start_date = this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' 00:00:00';
      } else {
        this.committee.committee_start_date = null;
      }
      if (this.expiredDateModel) {
        this.committee.committee_expired_date = this.expiredDateModel.year
          + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day + ' 00:00:00';
      } else {
        this.committee.committee_expired_date = null;
      }
    }
  }

  close(res) {
    this.expiredDateModel = null;
    this.startDateModel = null;
    this.isDateError = false;
    this.submitted = false;
    this.edit = false;
    this._ngbActiveModal.close(res);
  }

  dismiss() {
    this.expiredDateModel = null;
    this.startDateModel = null;
    this.isDateError = false;
    this.submitted = false;
    this.edit = false;
    this._ngbActiveModal.dismiss();
  }

  clearDate(type) {
    if (type == 'startDate') {
      this.startDateModel = null;
    }
    if (type == 'endDate') {
      this.expiredDateModel = null;
    }
    this.isDateError = false;
    this.validateDates();
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
