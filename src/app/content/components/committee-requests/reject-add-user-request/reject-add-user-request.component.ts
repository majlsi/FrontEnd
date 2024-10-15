
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { AddUserRequestService } from '../../../../core/services/request/addUserRequest.service';


@Component({
  selector: 'm-reject-add-user-request',
  templateUrl: './reject-add-user-request.component.html',
  styleUrls: ['./reject-add-user-request.component.scss']
})
export class RejectAddUserRequestComponent implements OnInit {
	submitted: boolean = false;
	@Input() request: any;
	edit: boolean = false;
	rejectReason: any;
	constructor(
	  private _ngbActiveModal: NgbActiveModal,
	  private _requestService:AddUserRequestService,
	  private router: Router,
	  private translate: TranslateService,
	  private layoutUtilsService: LayoutUtilsService,
	) { }

	ngOnInit(): void { }


	reject() {
	  this._requestService.rejectRequest({reject_reason:this.rejectReason}, this.request.id).subscribe(
		res => {
		  this.close(res);
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
