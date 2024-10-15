import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Observable, forkJoin } from 'rxjs';
import { attachment } from '../../../../core/config/attachment';
import { Committee } from '../../../../core/models/committee';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'default-add-final-output-file',
  templateUrl: './add-final-output-file.component.html',
  styleUrls: []
})
export class AddFinalOutputFileComponent implements OnInit {

  submitted: boolean = false;
  edit: boolean = false;
  closeResult: string;
  @Input() committee: Committee;
  attachmentUrl: string;
  attachmentTypeError: boolean = false;
  attachmentExtensions: Array<string> = ['jpeg', 'jpg', 'png', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];
  attachmentSizeError: string = '';
  attachmentChangedEvent: any;
  uploadAttachmentsObs: Observable<any>;
  isArabic: boolean;
  finalOutputDateModel: any;
  constructor(
    private _ngbActiveModal: NgbActiveModal,
    private _committeeService: CommitteeService,
    private translate: TranslateService,
    private _translationService: TranslationService,
    private layoutUtilsService: LayoutUtilsService,
    private _uploadService: UploadService
  ) { }

  ngOnInit(): void {
    this.isArabic = this._translationService.isArabic();
 
    this.formatDate('object');
  }


  validateFile() {
    this.attachmentSizeError = '';
    const fileSize = this.attachmentChangedEvent ? (this.attachmentChangedEvent.size / 1000) : 0;
    if (fileSize > attachment.file_size || fileSize === 0 && this.attachmentChangedEvent) {
      this.attachmentSizeError = this.translate.instant('AUTH.VALIDATION.FILE_SIZE', {
        name: this.translate.instant('COMMITTEES.FINAL_OUTPUT.FINAL_OUTPUT_DOCUMENT'),
        size: '2 MB'
      });
    }
  }

  uploadAttachments(file: File) {
    if (file) {
      this.uploadAttachmentsObs = this._uploadService.uploadCommitteeDocument<File>(file, this.committee.id);
    }
  }

  save(finalOutputForm: NgForm) {
    this.submitted = true;
    this.edit = true;
    this.validateFile();
    if (finalOutputForm.valid && !this.attachmentTypeError && this.attachmentSizeError.length === 0) { // submit form if valid
      if (this.attachmentChangedEvent) {
        this.uploadAttachments(this.attachmentChangedEvent);
        forkJoin(this.uploadAttachmentsObs).subscribe(data => {
          this.committee.final_output_url = data[0].url;
          this.addFinalOutputFile();
        }, error => {
          this.submitted = false;
        });
      } else {
        this.addFinalOutputFile();
      }
    } else {
      this.submitted = false;
    }
  }

  addFinalOutputFile() {
    this.formatDate('string');
    this._committeeService.addFinalOutputFileToCommittee(this.committee.id, this.committee).subscribe(
      res => {
        this.close(res);
      }, error => {
        this.submitted = false;
        this.layoutUtilsService.showActionNotification(
          this.isArabic ? error['Errors'].error_ar : error['Errors'].error,
          MessageType.Delete
        );
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

  clearDate() {
    this.finalOutputDateModel = null;
  }

  decideClosure(event, datepicker) {
    const path = event.composedPath().map(p => p.localName);
    if (!path.includes('ngb-datepicker')) {
      datepicker.close();
    }
  }

  formatDate(type) {
    if (type === 'object') {
      if (this.committee.final_output_date) {
        const startDate = new Date(this.committee.final_output_date);
        this.finalOutputDateModel = {
          day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear()
        };
      }
    } else {
      if (this.finalOutputDateModel) {
        this.committee.final_output_date =
          this.finalOutputDateModel.year + '-' + this.finalOutputDateModel.month
          + '-' + this.finalOutputDateModel.day + ' 00:00:00';
      } else {
        this.committee.final_output_date = null;
      }
    }
  }
}
