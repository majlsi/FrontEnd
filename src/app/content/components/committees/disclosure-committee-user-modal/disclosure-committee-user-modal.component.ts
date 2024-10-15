import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Evaluation } from '../../../../core/models/evaluation';
import { User } from '../../../../core/models/user';
import { EnvironmentVariableService } from '../../../../core/services/enviroment-variable/enviroment-variable.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Observable } from 'rxjs';
import { attachment } from '../../../../core/config/attachment';
import { TranslateService } from '@ngx-translate/core';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';

@Component({
  selector: 'default-disclosure-committee-user-modal',
  templateUrl: './disclosure-committee-user-modal.component.html',
  styleUrls: []
})
export class DisclosureCommitteeUserModalComponent implements OnInit {
  evaluation = new Evaluation();

  @Input() evaluationList: any;
  @Input() user: User;
  @Output() DisclosureEmitter = new EventEmitter();

  submitted: boolean = false;
  isArabic: boolean;
  edit: boolean = false;
  errors: Array<any> = [];
  closeResult: string;

  attachmentDisclosureTypeError: boolean = false;
  attachmentDisclosureSizeError: string = '';
  attachmentDisclosureUrl: string;
  attachmentDisclosureUrlObs: Observable<any>;
  attachmentDisclosureChangedEvent: any;
  attachmentExtensions: Array<String> = ['jpeg', 'jpg', 'png', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];



  constructor(
    private _translationService: TranslationService,
    private _committeeService: CommitteeService,
    private translate: TranslateService,
    private _ngbActiveModal: NgbActiveModal,
    private layoutUtilsService: LayoutUtilsService
  ) {

  }

  ngOnInit() {
    this.getLanguage();
    if (this.user) {
      this.evaluation.evaluation_id = this.user.evaluation_id;
      this.evaluation.evaluation_reason = this.user.evaluation_reason;
    }
  }

  save(committeeForm: NgForm) {
    this.submitted = true;
    this.edit = true;
    this.errors = [];
    this.validateFile();
    if (
      committeeForm.valid && !this.attachmentDisclosureTypeError
      && this.attachmentDisclosureSizeError.length === 0
    ) {
      this._committeeService.addDisclosureToCommitteeUser(this.user.committee_user_id, this.user.is_conflict,
        this.attachmentDisclosureChangedEvent).subscribe(
          {
            next: (res) => {
              this.layoutUtilsService.showActionNotification(
                this.isArabic ? res.message.message_ar : res.message.message, MessageType.Create
              );
              this.submitted = false;
            }, error: (err) => {
              this.layoutUtilsService.showActionNotification(
                this.isArabic ? err.error[0].error_ar : err.error[0].error, MessageType.Create
              );
              this.submitted = false;
            }, complete: () => {
              this._ngbActiveModal.close();
            },
          }
        );
      this.submitted = false;
    } else {
      this.submitted = false;
    }
  }

  validateFile() {
    this.attachmentDisclosureSizeError = '';
    const disclosureFileSize = this.attachmentDisclosureChangedEvent ? (this.attachmentDisclosureChangedEvent.size / 1000) : 0;
    if (disclosureFileSize > attachment.file_size) {
      this.attachmentDisclosureSizeError = this.translate.instant('COMMITTEES.VALIDATION.DECISION_File_SIZE_ERROR');
    } else if (this.attachmentDisclosureChangedEvent && disclosureFileSize < attachment.min_file_size) {
      this.attachmentDisclosureSizeError = this.translate.instant('COMMITTEES.VALIDATION.MIN_DECISION_File_SIZE_ERROR');
    } else if (disclosureFileSize === 0 && this.attachmentDisclosureChangedEvent) {
      this.attachmentDisclosureSizeError = this.translate.instant('COMMITTEES.VALIDATION.DECISION_File_ZERO_SIZE_ERROR');
    }
  }

  fileDisclosureUrlChangeEvent(event: any): void {
    this.attachmentDisclosureSizeError = '';
    this.attachmentDisclosureTypeError = false;
    if (event.target.files[0]) {
      const extension = event.target.files[0].name.split('.');
      this.attachmentDisclosureChangedEvent = event.target.files[0];
      this.attachmentDisclosureUrl = event.target.files[0].name;
      this.attachmentDisclosureTypeError =
        (this.attachmentExtensions.includes(extension[extension.length - 1].toLowerCase())) ? false : true;
    } else {
      this.attachmentDisclosureUrl = null;
      this.attachmentDisclosureChangedEvent = null;
    }
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

  getLanguage() {
    this.isArabic = this._translationService.isArabic();
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
}
