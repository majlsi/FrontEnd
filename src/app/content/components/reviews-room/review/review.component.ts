import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { TranslationService } from "../../../../core/services/translation.service";
import { CommitteeService } from "../../../../core/services/committee/committee.service";
import { Committee } from "../../../../core/models/committee";
import { Observable, forkJoin } from "rxjs";
import { Document } from '../../../../core/models/document';
import { User } from "../../../../core/models/user";
import { TranslateService } from "@ngx-translate/core";
import { UploadService } from "../../../../core/services/shared/upload.service";
import { LayoutUtilsService, MessageType } from "../../../../core/services/layout-utils.service";
import { DocumentStatuses } from "../../../../core/models/enums/document-statuses";

@Component({
	selector: "m-review",
	templateUrl: "./review.component.html",
	changeDetection: ChangeDetectionStrategy.Default,
})
export class ReviewComponent implements OnInit {

	documentId: number;
	document: Document = new Document();
	isArabic: boolean;
	committees: Array<Committee> = [];
	committeesObs: Observable<Committee[]>;
	committeeUsers: Array<User> = [];
	committeeLabel: string = "committee_name_ar";
	userLabel: string = 'name_ar';
	edit: boolean = false;
	submitted: boolean = false;
	startDateModel: any;
	endDateModel: any;
	documentUrl: string;
	documentSizeError: string = '';
	fileExtensions: Array<String> = ['jpeg', 'jpg', 'png', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'];
	docuemntChangedEvent: any;
	fileTypeError: boolean = false;
	documentUrlObs: Observable<any>;
	toDay: any;
	documentStatuses = DocumentStatuses;
	startTimeModel: any;
	endTimeModel: any;
	_startTimemeridian = true;
	_endTimemeridian = true;
	timeToError = false;
	constructor(
		private _crudService: CrudService,
		private route: ActivatedRoute,
		private router: Router,
		private _uploadService: UploadService,
		private translate: TranslateService,
		private committeeService: CommitteeService,
		private _translationService: TranslationService,
		private layoutUtilsService: LayoutUtilsService
	) {}

	ngOnInit() {
		this.startTimeModel = { hour: 12, minute: 0, second: 0 };
		this.endTimeModel = { hour: 13, minute: 0, second: 0 };
		this.getLanguage();
		this.getOrganizationMeetingCommittees();
		this.route.params.subscribe(params => {
			forkJoin([this.committeesObs])
				.subscribe(data => {
					this.committees = data[0];
					if (params['id']) {
						this.documentId = +params['id']; // (+) converts string 'id' to a number
						this.getDocument();
					}
				},
				error => {
				});
		});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		this.committeeLabel = this.isArabic? 'committee_name_ar' : 'committee_name_en';
		this.userLabel = this.isArabic? 'name_ar' : 'name';
	}

	getOrganizationMeetingCommittees() {
		this.committeesObs = this.committeeService.getUserCommittees<Committee>();
	}

	getDocument() {
		this._crudService.get<Document>('admin/documents',this.documentId).subscribe(res => {
			this.document = res;
			this.documentUrl = this.document.document_name;
			this.checkIfCommiteeExit();
			this.formatDate('object');
			this.getCommitteeUsers(false);
		}, error => {
		});
	}

	getCommitteeUsers(commiteeChanged){
		this.committeeUsers = [];
		this.document.document_users_ids = commiteeChanged? [] : this.document.document_users_ids;
		if(this.document.committee_id) {
			this._crudService.getList<User>('admin/committees/'+ this.document.committee_id +'/committee-users').subscribe(res => {
				this.committeeUsers = res;
				this.checkIfUsersExit();
			}, error => {
			});
		}
	}

	formatDate(type){
		if (type == 'object') {
			let startDate = new Date(this.document.review_start_date);
			let endDate = new Date(this.document.review_end_date);

			this.startDateModel = { day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear() };
			this.endDateModel = { day: endDate.getDate(), month: endDate.getMonth() + 1, year: endDate.getFullYear() };
			this.startTimeModel = { hour: startDate.getHours(), minute: startDate.getMinutes(), second: 0 };
			this.endTimeModel = { hour: endDate.getHours(), minute: endDate.getMinutes(), second: 0 };
		} else {
			this.document.review_start_date = this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' ' + (this.startTimeModel.hour != null? this.startTimeModel.hour : '00') + ':' + (this.startTimeModel.minute != null? this.startTimeModel.minute : '00') + ':00';
			this.document.review_end_date = this.endDateModel.year + '-' + this.endDateModel.month + '-' + this.endDateModel.day + ' ' + (this.endTimeModel.hour != null? this.endTimeModel.hour : '00') + ':' + (this.endTimeModel.minute != null? this.endTimeModel.minute : '00') + ':00';
		}
	}

	fileChangeEvent(event: any): void {
		this.documentSizeError = '';
		this.fileTypeError = false;
		if(event.target.files[0]){
			const extension = event.target.files[0].name.split('.');
			this.docuemntChangedEvent = event.target.files[0];
			this.documentUrl = event.target.files[0].name;
			this.fileTypeError = (this.fileExtensions.includes(extension[extension.length - 1].toLowerCase()))? false : true;
		} else {
			this.documentUrl = null;
			this.docuemntChangedEvent = null;
		}
		
	}

	hasError(reviewDocForm: NgForm, field: string, validation: string) {
		if (reviewDocForm && Object.keys(reviewDocForm.form.controls).length > 0 && reviewDocForm.form.controls[field] &&
			reviewDocForm.form.controls[field].errors && validation in reviewDocForm.form.controls[field].errors) {
            if (validation) {
				return (reviewDocForm.form.controls[field].dirty &&
					reviewDocForm.form.controls[field].errors[validation]) || (this.edit && reviewDocForm.form.controls[field].errors[validation]);
            }
			return (reviewDocForm.form.controls[field].dirty &&
				reviewDocForm.form.controls[field].invalid) || (this.edit && reviewDocForm.form.controls[field].invalid);
        }
	}

	setEndDateEqualFrom(){
		if(this.endDateModel && this.endDateModel.year && this.endDateModel.month && this.endDateModel.day &&
			this.startDateModel && this.startDateModel.year && this.startDateModel.month && this.startDateModel.day){
			let startDate = new Date(this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day);
			let endDate = new Date(this.endDateModel.year + '-' + this.endDateModel.month + '-' + this.endDateModel.day);
			if(startDate > endDate){
				this.endDateModel = this.startDateModel;
			}
		}
	}

	decideClosure(event, datepicker) {
		const path = event.composedPath().map(p => p.localName);
		if (!path.includes('ngb-datepicker')) {
			datepicker.close();
		}
	}

	save(reviewDocForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		this.changeTime();
		if (reviewDocForm.valid && !this.fileTypeError && this.timeToError === false) {
			this.formatDate('string');
			if (this.documentId) { // edit
				if (this.docuemntChangedEvent) {
					this.fileUploader();
					forkJoin([this.documentUrlObs]).subscribe(data => {
						this.document.document_url = data[0].url;
						this.document.document_name = this.documentUrl;
						this.updateDocument();
					}, error => {
						this.documentSizeError = this.translate.instant('REVIEWS_ROOM.VALIDATION.SIZE_ERROR');
						this.submitted = false;
					});
				} else {
					this.updateDocument();
				}
			} else { // add
				this.fileUploader();
				forkJoin([this.documentUrlObs]).subscribe(data => {
					this.document.document_url = data[0].url;
					this.document.document_name = this.documentUrl;
					this.addDocument();
				}, error => {
					this.documentSizeError = this.translate.instant('REVIEWS_ROOM.VALIDATION.SIZE_ERROR');
					this.submitted = false;
				});
			}
		} else {
			this.submitted = false;
		}
	}

	fileUploader(){
		this.documentUrlObs = this._uploadService.uploadDocument<File>(this.docuemntChangedEvent);
	}

	updateDocument() {
		this._crudService.edit<any>('admin/documents', this.document, this.documentId).subscribe(res => {
            this.layoutUtilsService.showActionNotification(this.isArabic? res.message_ar : res.message, MessageType.Create);
			this.submitted = false;
			this.redirect();
		}, error => {
			this.submitted = false;
            this.layoutUtilsService.showActionNotification(this.isArabic? error.error_ar : error.error, MessageType.Create);
		});
	}

	addDocument() {
		this._crudService.add<any>('admin/documents', this.document).subscribe(res => {
            this.layoutUtilsService.showActionNotification(this.isArabic? res.message_ar : res.message, MessageType.Create);
			this.submitted = false;
			this.redirect();
		}, error => {
			this.submitted = false;
            this.layoutUtilsService.showActionNotification(error.error, MessageType.Create);
		});
	}

	redirect() {
		this.router.navigate(["/reviews-room"]);
	}
	changeTime() {
		if (this.startTimeModel && this.endTimeModel && this.startDateModel && this.endDateModel) {
			let startDate;
			let endDate;
			startDate = new Date(this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' ' + this.startTimeModel.hour + ':' + this.startTimeModel.minute + ':' + this.startTimeModel.second);
			endDate = new Date(this.endDateModel.year + '-' + this.endDateModel.month + '-' + this.endDateModel.day + ' ' + this.endTimeModel.hour + ':' + this.endTimeModel.minute + ':' + this.endTimeModel.second);
			if(startDate > endDate){
				this.timeToError = true;
			} else {
				this.timeToError = false;
			}
		} else {
			this.timeToError = false;
		}
	}

	checkIfCommiteeExit() {
		let commiteeIndex = this.committees.findIndex(committee => committee.id == this.document.committee_id);
		if (commiteeIndex == -1) {
			this._crudService.get<Committee>('admin/committees',this.document.committee_id).subscribe(res => {
				let committee = new Committee();
				committee.id = res['Results'].id;
				committee.committee_name_ar = res['Results'].committee_name_ar;
				committee.committee_name_en = res['Results'].committee_name_en;
				this.committees.push(committee);
			});
		}
	}

	checkIfUsersExit() {
		this.document.reviewres.forEach(reviewer => {
		 	let reviewerIndex = this.committeeUsers.findIndex(user => user.id == reviewer.id);
			if (reviewerIndex == -1) {
		 		let committeeUser = new User();
		 		committeeUser.id = reviewer.id;
				committeeUser.name = reviewer.name;
				committeeUser.name_ar = reviewer.name_ar;
				this.committeeUsers.push(committeeUser);
			}
		});
	}
}
