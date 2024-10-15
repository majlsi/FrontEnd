import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CrudService } from '../../../../../core/services/shared/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LayoutUtilsService, MessageType } from '../../../../../core/services/layout-utils.service';
import { TranslationService } from '../../../../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { CommitteeService } from '../../../../../core/services/committee/committee.service';
import { UploadService } from '../../../../../core/services/shared/upload.service';
import { NgForm } from '@angular/forms';
import { Request } from '../../../../../core/models/request';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { RejectRequestComponent } from '../../reject-request/reject-request.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'm-unfreeze-member-request',
  templateUrl: './unfreeze-member-request.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class UnfreezeMemberRequestComponent implements OnInit  {

	request = new Request();
	submitted: boolean = false;
	requestId: number;
	errors: Array<String>;
	isArabic: boolean;
	error: Array<any>;
	startDateModel: any;
	expiredDateModel: any;
	isDateError: boolean = false;
	attachmentUrl: string;
	attachmentUrlObs: Observable<any>;
	imagesBaseURL = environment.imagesBaseURL;
	edit: boolean = false;
  constructor(
		private _crudService: CrudService,
		private route: ActivatedRoute,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		private _uploadService: UploadService,
		private _committeeService: CommitteeService,
		private _modalService: NgbModal,
	) {

	}
  ngOnInit() {
	this.getLanguage();
	const startDate = new Date();
	this.startDateModel = { day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear() };
    this.route.params.subscribe(params => {
			if (params['id']) {
				this.requestId = +params['id'];
				this.getRequest();				
			}
  	})
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
	clearDate(type) {
		if (type == 'startDate') {
			this.startDateModel = null;
		}
		if (type == 'endDate') {
			this.expiredDateModel = null;
		}
		this.isDateError = false;
		this.validateDates();
	}

  validateDates() {
		if (this.expiredDateModel && this.startDateModel) {
			let startDate;
			let endDate;
			startDate = new Date(this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day);
			endDate = new Date(this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day);
			if (startDate > endDate) {
				this.isDateError = true;
			} else {
				this.isDateError = false;
			}
		}
	}

  setEndDateEqualFrom() {
		if (this.expiredDateModel && this.expiredDateModel.year && this.expiredDateModel.month && this.expiredDateModel.day &&
			this.startDateModel && this.startDateModel.year && this.startDateModel.month && this.startDateModel.day) {
			const startDate = new Date(this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day);
			const endDate = new Date(this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day);
			if (startDate > endDate) {
				this.expiredDateModel = this.startDateModel;
			}
			this.isDateError = false;
		}
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
		}
	}
  
	getRequest() {
		this._crudService.get<Request>('unfreeze-members-requests', this.requestId).subscribe(
			res => {
				this.request = res;
			},
			error => {
			});
	}
  decideClosure(event, datepicker) {
		const path = event.composedPath().map(p => p.localName);
		if (!path.includes('ngb-datepicker')) {
			datepicker.close();
		}
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

	downloadEvidenceFile(){
		this._uploadService.downloadFile(this.imagesBaseURL + this.request.evidence_document_url).subscribe((res) => {
			const downloadURL = window.URL.createObjectURL(res);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = this.translate.instant('REQUEST.ADD.EVIDENCE_DOCUMENT') + '.' + this.request.evidence_document_url.split('.').pop();
			link.click();
		});
	}

	save(requestForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		if (requestForm.valid) {
		  this.formatDate('string');
		  this.accept();
		} else {
		  this.submitted = false;
		}
	  }
	accept(){
		this._committeeService.unfreezeCommittee(this.request,this.requestId).subscribe(
			(res) => {
			const _successMessage = this.translate.instant('REQUEST.ADD.UNFREEZEREQUESTSUCCESS');
			this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Create);
			this.redirect();
		},
		error => {
			this.submitted = false;
			this.error = error.error;
			if (error.error_code === 3) {
				this.errors = error.message;
			}
		});
	
	}

	reject(){
		const modelRef = this._modalService.open(RejectRequestComponent, {
			centered: true, size: 'lg', backdrop: 'static', keyboard: false
		});
		modelRef.componentInstance.request = this.request;

	}
}
