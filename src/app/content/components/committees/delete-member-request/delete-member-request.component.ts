import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { NgbModal, ModalDismissReasons, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { User } from "../../../../core/models/user";
import { NgForm } from "@angular/forms";
import { attachment } from "../../../../core/config/attachment";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable, Subject, BehaviorSubject } from "rxjs";
import { UploadService } from "../../../../core/services/shared/upload.service";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { LayoutUtilsService, MessageType } from "../../../../core/services/layout-utils.service";
import { EnvironmentVariableService } from "../../../../core/services/enviroment-variable/enviroment-variable.service";
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
	selector: "m-delete-member-request",
	templateUrl: "./delete-member-request.component.html",
	styleUrls: ["./delete-member-request.component.scss"],
})
export class DeleteMemberRequestComponent implements OnInit {
	deleteReason = { delete_reason: "", proof_file: null , committee_id:0,committee_name:""};

	proof_file: string;
	attachmentTypeError: boolean = false;
	attachmentExtensions: Array<String> = ["jpeg", "jpg", "png", "doc", "docx", "odt", "xls", "xlsx", "ppt", "pptx", "pdf", "txt"];
	attachmentSizeError: string = "";
	attachmentChangedEvent: any;
	attachmentDecisionChangedEvent: any;
	attachmentDecisionUrlObs: Observable<any>;
	@Input() committeeId;
	@Input() committeeName;
	error: Array<any>;
	errors: Array<any>;
	submitted: boolean = false;
	edit: boolean = false;
	closeResult: string;
	modalReference: NgbModalRef;
	@Input() user:User;



	isArabic: boolean;
	attachmentEvidenceUrl:string;
	attachmentEvidenceUrlObs: Observable<any>;
	attachmentEvidenceChangedEvent: any;

	constructor(
		private modalService: NgbModal,
		private translate: TranslateService,
		private translationService: TranslationService,
		private _uploadService: UploadService,
		private _committeeService: CommitteeService,
		private _crudService: CrudService,
		private layoutUtilsService: LayoutUtilsService
	) {

	}

	ngOnInit() {
		this.isArabic = this.translationService.isArabic();
	}

	open(content) {
		this._committeeService.canRequestDeleteUser(this.user.id).subscribe(
			res => {
				if (res.Results) {
					this.modalReference = this.modalService.open(content, { size: 'custom-modal-size' });

					this.modalReference.result.then(
						(result) => {
							this.closeResult = `Closed with: ${result}`;
						},
						(reason) => {
							this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
						}
					);
				} else {
					this.layoutUtilsService.showActionNotification(this.isArabic ? res.Errors.error_message_ar : res.Errors.error_message);
				}
			}, err => {
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

			if (this.attachmentEvidenceUrl) {
				this.uploadEvidenceDocument(this.attachmentEvidenceChangedEvent);
				forkJoin(this.attachmentEvidenceUrlObs).subscribe(
					(data) => {

						this.deleteReason.proof_file = data[0].url;
						this.RemoveMemberRequest();
					},
					(error) => {
						this.submitted = false;
					}
				);
			}
			else{
				this.RemoveMemberRequest();
			}
			this.close();
		} else {
			this.submitted = false;
		}
	}

	RemoveMemberRequest() {
		this.deleteReason.committee_id=this.committeeId;
		this.deleteReason.committee_name=this.committeeName;

		this._crudService.add<Request>(`requests/delete-user/${this.user.id}`, this.deleteReason).subscribe(
			(data) => {

				const _successMessage = this.translate.instant("COMMITTEES.DELETE.DELETEMEMBERREQUESTMSG");
				this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
			},
			(error) => {
				this.submitted = false;
				if (error.error_code === 4) {
					this.layoutUtilsService.showActionNotification(this.isArabic ? error.Errors.error_message_ar : error.Errors.error_message);
					return;
				}
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






	fileEvidenceUrlChangeEvent(event: any): void {

		this.attachmentSizeError = '';
		this.attachmentTypeError = false;
		if (event.target.files[0]) {
			const extension = event.target.files[0].name.split('.');
			this.attachmentEvidenceChangedEvent = event.target.files[0];
			this.attachmentEvidenceUrl = event.target.files[0].name;
			this.attachmentTypeError = (this.attachmentExtensions.includes(extension[extension.length - 1].toLowerCase())) ? false : true;
		} else {
			this.attachmentEvidenceUrl = null;
			this.attachmentEvidenceChangedEvent = null;
		}
    }

    uploadEvidenceDocument (file: File) {
        if (file) {
            this.attachmentEvidenceUrlObs = this._uploadService.uploadEvidenceDocument<File>(file);
        }
    }



	close() {
		this.submitted = false;
		this.edit = false;
		this.modalReference.close();
	}
}
