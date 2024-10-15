
import { Component, Inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// Services
import { TranslationService } from '../../../../core/services/translation.service';

// Models
import { MeetingParticipantAlternative } from '../../../../core/models/meeting-participant-alternative';
import { NgForm } from '@angular/forms';
@Component({
	selector: 'm-rejection-reasons',
	templateUrl: './rejection-reasons.component.html'
})
export class RejectionReasonsComponent implements OnInit {

	isArabic: boolean;
	rejectionReason = new MeetingParticipantAlternative();
	submitted: boolean = false;
	edit: boolean = false;
	constructor(private modalService: NgbModal,
		public activeModal: NgbActiveModal,
		private _translationService: TranslationService) { }


	ngOnInit() {
		this.reset();
		this.getLanguage();
	}

	reset() {
		this.rejectionReason = new MeetingParticipantAlternative();
		this.submitted = false;
		this.edit = false;
	}

	save(rejectionReasonForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		if (rejectionReasonForm.valid) { // submit form if valid
			this.activeModal.close(this.rejectionReason);
		} else {
			this.submitted = false;
		}
	}



	hasError(rejectionReasonForm: NgForm, field: string, validation: string) {
		if (rejectionReasonForm && Object.keys(rejectionReasonForm.form.controls).length > 0 &&
			rejectionReasonForm.form.controls[field].errors && validation in rejectionReasonForm.form.controls[field].errors) {
			if (validation) {
				return (rejectionReasonForm.form.controls[field].dirty &&
					rejectionReasonForm.form.controls[field].errors[validation])
					|| (this.edit && rejectionReasonForm.form.controls[field].errors[validation]);
			}
			return (rejectionReasonForm.form.controls[field].dirty &&
				rejectionReasonForm.form.controls[field].invalid) || (this.edit && rejectionReasonForm.form.controls[field].invalid);
		}
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

}
