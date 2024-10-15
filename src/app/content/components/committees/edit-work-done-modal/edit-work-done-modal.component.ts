import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbModalRef, NgbNavChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { NgForm } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable, Subject, BehaviorSubject } from "rxjs";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { LayoutUtilsService, MessageType } from "../../../../core/services/layout-utils.service";
import { EnvironmentVariableService } from "../../../../core/services/enviroment-variable/enviroment-variable.service";


@Component({
  selector: 'm-edit-work-done-modal',
  templateUrl: './edit-work-done-modal.component.html',
  styleUrls: ['./edit-work-done-modal.component.scss']
})
export class EditWorkDoneModalComponent implements OnInit,AfterViewInit{
	works_done = { work_done: '', committee_id: 0, work_done_date: null };

	error: Array<any>;
	errors: Array<any>;
	submitted: boolean = false;
	edit: boolean = false;
	closeResult: string;
	modalReference: NgbModalRef;
	@Input() work:any;
	workDoneDateModel: any;
	@Output() editWorkEmiter = new EventEmitter();



	constructor(
		private modalService: NgbModal,
		private translate: TranslateService,
		private _crudService: CrudService,
		private _environmentVariableService :EnvironmentVariableService,
		private layoutUtilsService: LayoutUtilsService
	) {

	}
	ngAfterViewInit(): void {
		this.works_done.work_done = this.work.work_done;
		this.works_done.committee_id = this.work.committee_id;
		this.formatDate('object');
	}

	ngOnInit() {

	}

	open(content) {
		this.modalReference = this.modalService.open(content, { size: "custom-modal-size" });

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
			return "by pressing ESC";
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return "by clicking on a backdrop";
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
			this.editWork();
		} else {
			this.submitted = false;
		}
	}

	editWork() {



		this._crudService.edit(`admin/works-done`, this.works_done,this.work.id).subscribe(
			(data) => {
				this.editWorkEmiter.emit(data);
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
			if (this.work.work_done_date) {
				const startDate = new Date(this.work.work_done_date);
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
		this.submitted = false;
		this.edit = false;
		this.modalReference.close();
	}
}
