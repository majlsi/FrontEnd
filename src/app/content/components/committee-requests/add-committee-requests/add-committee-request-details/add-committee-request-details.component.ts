import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CrudService } from '../../../../../core/services/shared/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutUtilsService, MessageType } from '../../../../../core/services/layout-utils.service';
import { TranslationService } from '../../../../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { UploadService } from '../../../../../core/services/shared/upload.service';
import { CommitteeService } from '../../../../../core/services/committee/committee.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Request } from '../../../../../core/models/request';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../../../environments/environment';
import { CommitteeTypeEnum } from '../../../../../core/models/enums/committee-Types';
import { RejectRequestComponent } from '../../reject-request/reject-request.component';
import { CommitteeRequestService } from '../../../../../core/services/request/committeeRequest.service';
import { AdminRequestTypes } from '../../../../../core/models/enums/admin-request-types';
@Component({
	selector: 'm-add-committee-request-details',
	templateUrl: './add-committee-request-details.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class AddCommitteeRequestDetailsComponent implements OnInit {
	request = new Request();
	submitted: boolean = false;
	requestId: number;
	errors: Array<String>;
	isArabic: boolean;
	error: Array<any>;
	edit: boolean = false;
	removeCommitteeCode: boolean = false;
	committeeTypeEnum = CommitteeTypeEnum;
	adminRequestTypesEnum = AdminRequestTypes;
	displayedColumns = ['name', 'email', 'committee_user_start_date', 'committee_user_expired_date'];
	startDateModel: any;
	expiredDateModel: any;
	decisionDateModel: any;

	constructor(
		private _crudService: CrudService,
		private route: ActivatedRoute,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		private _uploadService: UploadService,
		private _committeeService: CommitteeService,
		private _requestService: CommitteeRequestService,
		private _modalService: NgbModal,
	) {

	}

	ngOnInit() {
		this.getLanguage();
		
		
		this._committeeService.getRemoveCommitteeCodeFeatureVariable().subscribe(
			res => {
				this.removeCommitteeCode = res.removeCommitteeCodeField;
			}
		);
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.requestId = +params['id'];
				this.getRequest();
			}
		});
	}

	getRequest() {
		this._crudService.get<Request>('unfreeze-members-requests', this.requestId).subscribe(
			res => {
				this.request = res;
				this.formatDate('object');
			},
			error => {
			});
	}


	formatDate(type) {
		if (type == 'object') {
			if (this.request.request_body.committee_start_date) {
				const startDate = new Date(this.request.request_body.committee_start_date);
				this.startDateModel = { day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear() };
			}
			if (this.request.request_body.committee_expired_date) {
				const endDate = new Date(this.request.request_body.committee_expired_date);
				this.expiredDateModel = { day: endDate.getDate(), month: endDate.getMonth() + 1, year: endDate.getFullYear() };
			}
			if (this.request.request_body.decision_date) {
				const decisionDate = new Date(this.request.request_body.decision_date);
				this.decisionDateModel = { day: decisionDate.getDate(), month: decisionDate.getMonth() + 1, year: decisionDate.getFullYear() };
			}
		} else {
			if (this.startDateModel) {
				this.request.request_body.committee_start_date = this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' 00:00:00';
			} else {
				this.request.request_body.committee_start_date = null;
			}
			if (this.expiredDateModel) {
				this.request.request_body.committee_expired_date = this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day + ' 00:00:00';
			} else {
				this.request.request_body.committee_expired_date = null;
			}
			if (this.decisionDateModel) {
				this.request.request_body.decision_date = this.decisionDateModel.year + '-' + this.decisionDateModel.month + '-' + this.decisionDateModel.day + ' 00:00:00';
			} else {
				this.request.request_body.decision_date = null;
			}
		}
	}

	save(requestForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		this.formatDate('string');
		if (this.adminRequestTypesEnum.addCommittee == this.request.request_type_id) {
			this.accept();
		} else if (this.adminRequestTypesEnum.updateCommittee == this.request.request_type_id) {
			this.acceptUpdateCommittee();

		}
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	hasError(requestForm: NgForm, field: string, validation: string) {
		if (requestForm && Object.keys(requestForm.form.controls).length > 0 &&
			requestForm.form.controls[field].errors && validation in requestForm.form.controls[field].errors) {
			if (validation) {
				return (requestForm.form.controls[field].dirty &&
					requestForm.form.controls[field].errors[validation]) || (this.edit && requestForm.form.controls[field].errors[validation]);
			}
			return (requestForm.form.controls[field].dirty &&
				requestForm.form.controls[field].invalid) || (this.edit && requestForm.form.controls[field].invalid);
		}
	}

	redirect() {
		this.router.navigate(['/committee-requests']);
	}

	downloadDecisionDocument() {
		this._uploadService.downloadFile(environment.imagesBaseURL + this.request.request_body.decision_document_url).subscribe((res) => {
			const downloadURL = window.URL.createObjectURL(res);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = this.translate.instant('COMMITTEES.ADD.DECISION_DOCUMENT') + '.' + this.request.request_body.decision_document_url.split('.').pop();
			link.click();
		});
	}

	checkFileType(url: string) {
		let extention = url.split('.').pop();
		if (extention) {
			extention = extention.toLowerCase();
		}
		if (['jpeg', 'jpg', 'png'].includes(extention)) {
			return 'image';
		} else if (extention === 'pdf') {
			return 'pdf';
		} else if (['doc', 'docx'].includes(extention)) {
			return 'doc';
		} else if (['avi', 'mov', 'mp4', 'wmv'].includes(extention)) {
			return 'video';
		} else if (['ppt', 'pptx'].includes(extention)) {
			return 'ppt';
		} else if (['xls', 'xlsx'].includes(extention)) {
			return 'xls';
		}
	}

	reject() {
		const modelRef = this._modalService.open(RejectRequestComponent, {
			centered: true, size: 'lg', backdrop: 'static', keyboard: false
		});
		modelRef.componentInstance.request = this.request;
	}

	accept() {
		this._requestService.acceptAddCommitteeRequest(this.request, this.request['id']).subscribe(
			res => {
				const _successMessage = this.translate.instant('REQUEST.ADD.ADDCOMMITTEEREQUESTSUCCESS');
				this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
				this.redirect();
			}, err => {
				this.submitted = false;
			}
		);
	}

	acceptUpdateCommittee() {
		this._requestService.acceptUpdateCommitteeRequest(this.request['id']).subscribe(
			res => {
				const _successMessage = this.translate.instant('COMMITTEES.ADD.UPDATE_COMMITTEE_REQUEST_SUCCESS_MSG');
				this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
				this.redirect();
			}, err => {
				this.submitted = false;
			}
		);
	}
}
