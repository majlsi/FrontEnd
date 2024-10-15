import { CommitteeUserRequest } from './../../../../core/models/committee-user-request';
import { Component, OnInit, Input, EventEmitter, Output, AfterViewInit } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbModalRef, NgbNavChangeEvent, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { User } from "../../../../core/models/user";
import { NgForm } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable, Subject, BehaviorSubject } from "rxjs";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { LayoutUtilsService, MessageType } from "../../../../core/services/layout-utils.service";
import { EnvironmentVariableService } from "../../../../core/services/enviroment-variable/enviroment-variable.service";
import { EvaluationTabs } from "../../../../core/models/enums/evaluation-tabs";
import { TranslationService } from '../../../../core/services/translation.service';
import { number } from 'ngx-custom-validators/src/app/number/validator';
import { Evaluation } from '../../../../core/models/evaluation';

@Component({
  selector: 'm-evaluate-member-modal',
  templateUrl: './evaluate-member-modal.component.html',
  styleUrls: ['./evaluate-member-modal.component.scss']
})
export class EvaluateMemberModalComponent implements OnInit{

	evaluation=new Evaluation();

	isArabic:boolean;
	submitted: boolean = false;
	edit: boolean = false;
	closeResult: string;

	@Input() user:User;
    @Input() evaluationList:any;

	@Output() evaluateMemberEmiter = new EventEmitter();



	errors: Array<any> = [];


	constructor(
		private modalService: NgbModal,
		private _translationService: TranslationService,
		private _crudService: CrudService,
		private _environmentVariableService :EnvironmentVariableService,
		private _ngbActiveModal: NgbActiveModal,
	) {

	}
	// ngAfterViewInit(): void {
	// 	// this.activeId = this.user.evaluation_id? String(this.user.evaluation_id):  "1" ;
	// 	this.evaluation=this.user;
	// 	console.log('user:',this.evaluation)

	// }

	ngOnInit() {
		this.getLanguage();
		if(this.user){

			this.evaluation.evaluation_id =this.user.evaluation_id;
			this.evaluation.evaluation_reason = this.user.evaluation_reason;
		}
	}





	save(memberForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		this.errors = [];
		if (memberForm.valid) {
			// submit form if valid
			this.evaluateMember();

		} else {
			this.submitted = false;
		}
	}

	evaluateMember() {

		this._crudService.edit(`admin/committee-users`, this.evaluation,this.user.committee_user_id).subscribe(
			(data) => {
				this.user.evaluation_id=data["evaluation_id"];
				this.user.evaluation_name_en=data["evaluation"]["evaluation_name_en"];
				this.user.evaluation_name_ar=data["evaluation"]["evaluation_name_ar"];
				this.user.evaluation_reason=data["evaluation_reason"];
				this.close(data);

			},
			(error) => {
				this.submitted = false;
				// this.error = error.error;
				// if (error.error_code === 3) {
				// 	this.errors = error.message;
				// }
			}
		);
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

	// beforeChange($event: NgbNavChangeEvent) {
	// 	this.activeId = $event.nextId;
	// }
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
