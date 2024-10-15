
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CrudService } from '../../../../core/services/shared/crud.service';

@Component({
	selector: 'm-add-work-modal',
	templateUrl: './add-work-modal.component.html',
	styleUrls: ['./add-work-modal.component.scss']
})
export class AddWorkModalComponent implements OnInit {

	works_done = { work_done: '', committee_id: 0, work_done_date: null };

	error: Array<any>;
	errors: Array<any>;
	submitted: boolean = false;
	edit: boolean = false;
	closeResult: string;
	modalReference: NgbModalRef;
	@Input() committeeId: Number;
	workDoneDateModel: any;
	@Output() addWorkEmitter = new EventEmitter();
	memberForm: any;



	constructor(
		private modalService: NgbModal,
		private _crudService: CrudService,
	) {

	}

	ngOnInit() {

	}

	open(content) {
		this.modalReference = this.modalService.open(content, { size: 'custom-modal-size' });

		this.modalReference.result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			}
		);
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

	save(memberForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		if (memberForm.valid) {
			// submit form if valid
			this.formatDate('string');
			this.addWorkDone();
		} else {
			this.submitted = false;
		}
	}

	addWorkDone() {
		this.works_done.committee_id = +this.committeeId;
		this._crudService.add(`admin/works-done`, this.works_done).subscribe(
			(data) => {
				this.addWorkEmitter.emit(data);
				this.close();
			},
			(error) => {
				this.submitted = false;
				this.error = error.error;
				if (error.error_code === 3) {
					this.errors = error.message;
				}
			}
		);
	}

	hasError(memberForm: NgForm, field: string, validation: string) {
		if (memberForm && Object.keys(memberForm.form.controls).length > 0 && memberForm.form.controls[field].errors && validation in memberForm.form.controls[field].errors) {
			if (validation) {
				return (memberForm.form.controls[field].dirty && memberForm.form.controls[field].errors[validation]) || (this.edit && memberForm.form.controls[field].errors[validation]);
			}
			return (memberForm.form.controls[field].dirty && memberForm.form.controls[field].invalid) || (this.edit && memberForm.form.controls[field].invalid);
		}
	}

	clearDate() {
		this.workDoneDateModel = null;
	}

	decideClosure(event, datepicker) {
		const path = event.composedPath().map(p => p.localName);
		if (!path.includes('ngb-datepicker')) {
			datepicker.close();
		}
	}

	formatDate(type) {
		if (type == 'object') {
			if (this.works_done.work_done_date) {
				const startDate = new Date(this.works_done.work_done_date);
				this.workDoneDateModel = {
					day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear()
				};
			}
		} else {
			if (this.workDoneDateModel) {
				this.works_done.work_done_date =
					this.workDoneDateModel.year + '-' + this.workDoneDateModel.month
					+ '-' + this.workDoneDateModel.day + ' 00:00:00';
			} else {
				this.works_done.work_done_date = null;
			}
		}
	}

	close() {
		this.works_done = { work_done: '', committee_id: 0, work_done_date: null };
		this.submitted = false;
		this.edit = false;
		if (this.memberForm) {
			this.memberForm.resetForm();
		}

		this.modalReference.close();
	}
}
