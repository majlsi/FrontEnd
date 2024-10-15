import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommitteeRequestService } from '../../../../core/services/request/committeeRequest.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';

@Component({
  selector: 'm-reject-request',
  templateUrl: './reject-request.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class RejectRequestComponent {
  submitted: boolean = false;
  @Input() request: Request;
  edit: boolean = false;
  reason: any;
  constructor(
    private _ngbActiveModal: NgbActiveModal,
    private _requestService:CommitteeRequestService,
    private router: Router,
    private translate: TranslateService,
    private layoutUtilsService: LayoutUtilsService,
  ) { }

  ngOnInit(): void { }


  reject() {
    let data = {
      reason: this.reason,
    };
    this._requestService.rejectRequest(data,this.request['id']).subscribe(
      res => {
        this.close(res);
        const _successMessage = this.translate.instant('REQUEST.ADD.REQUESTREJECT');
				this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
				this.redirect();
      }, err => {
        this.submitted = false;
      }
    );
  }

  save(rejectForm: NgForm) {
    this.submitted = true;
    this.edit = true;
    if (rejectForm.valid) {
      this.reject();
    } else {
      this.submitted = false;
    }
  }
  dismiss() {
    this.submitted = false;
    this.edit = false;
    this._ngbActiveModal.dismiss();
  }

  close(res) {
    this.submitted = false;
    this.edit = false;
    this._ngbActiveModal.close(res);
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

  redirect() {
		this.router.navigate(['/committee-requests']);
	}
}
