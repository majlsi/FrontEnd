import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { TranslationService } from "../../../../core/services/translation.service";
import { CommitteeService } from "../../../../core/services/committee/committee.service";
import { Committee } from "../../../../core/models/committee";
import { Observable, forkJoin } from "rxjs";
import { User } from "../../../../core/models/user";
import { TranslateService } from "@ngx-translate/core";
import { UploadService } from "../../../../core/services/shared/upload.service";
import { LayoutUtilsService, MessageType } from "../../../../core/services/layout-utils.service";
import { ApprovalStatusesEnum } from "../../../../core/models/enums/approval-statuses";
import { Approval } from "../../../../core/models/approval";
import { MeetingService } from "../../../../core/services/meeting/meeting.service";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserService } from "../../../../core/services/security/users.service";

@Component({
	selector: "m-approval",
	templateUrl: "./approval.component.html",
	changeDetection: ChangeDetectionStrategy.Default,
	providers: [NgbActiveModal]
})
export class ApprovalComponent implements OnInit {

	@Output() tabChanged: EventEmitter<string> = new EventEmitter();
	@Output() modalTabChange: EventEmitter<object> = new EventEmitter();
	@Input() meetingId: any;
	@Input() popupApprovalId: number;
	@Input() meetingCommitteeId: number;
	@Input() organizers: Array<any> = [];
	committeeDisable: boolean;

	approvalId: number;
	approval: Approval = new Approval();
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
	approvalUrl: string;
	approvalSizeError: string = '';
	fileExtensions: Array<String> = ['jpeg', 'jpg', 'png', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'];
	docuemntChangedEvent: any;
	fileTypeError: boolean = false;
	approvalUrlObs: Observable<any>;
	toDay: any;
	approvalStatuses = ApprovalStatusesEnum;

	constructor(
		private _crudService: CrudService,
		private _meetingService: MeetingService,
		private _userService: UserService,
		private route: ActivatedRoute,
		private router: Router,
		private _uploadService: UploadService,
		private translate: TranslateService,
		private committeeService: CommitteeService,
		private _translationService: TranslationService,
		public activeModal: NgbActiveModal,
		public _modal: NgbModal,
		private layoutUtilsService: LayoutUtilsService
	) { }

	ngOnInit() {
		this.getLanguage();
		this.getOrganizationMeetingCommittees();
		this.route.params.subscribe(params => {
			forkJoin([this.committeesObs])
				.subscribe(data => {
					this.committees = data[0];
					if (params['id']) {
						this.approvalId = +params['id']; // (+) converts string 'id' to a number
						this.getApproval();
					} else if (this.popupApprovalId != null) {
						this.approvalId = +this.popupApprovalId;
						this.getApproval();
					}
					if (this.meetingCommitteeId != null) {
						this.committeeDisable = true;
					}
					this.getAllCommitteeUsers();
				},
					error => {
					});
		});
	}

	getAllCommitteeUsers() {
		this._userService.getOrganizationUsersStakeholders({ name: '', include_stakeholders: false }).subscribe(
			res => {
				if (this.meetingCommitteeId != null) {
					const resultArray = [];
					const allUsers = res;
					const filteredUsers = this.organizers.filter(x => x.meeting_guest_id == null);
					filteredUsers.forEach(value => { resultArray.push(value); });
					this.approval.members.forEach(value => {
						if (!resultArray.map(x => x.id).includes(value) && allUsers.map(x => x.id).includes(value)) {
							resultArray.push(allUsers.find(item => item.id === value ));
						}
					});
					this.committeeUsers = resultArray;
				} else {
					this.committeeUsers = res;
					this.checkIfUsersExit();
				}
			}
		);
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		this.committeeLabel = this.isArabic ? 'committee_name_ar' : 'committee_name_en';
		this.userLabel = this.isArabic ? 'name_ar' : 'name';
	}

	getOrganizationMeetingCommittees() {
		this.committeesObs = this.committeeService.getUserCommittees<Committee>();
	}

	getApproval() {
		this._crudService.get<Approval>('admin/approvals', this.approvalId).subscribe(res => {
			this.approval = res;
			this.approval.members = this.approval.members.map(x => {
				return x['user_id'];
			});
			this.approvalUrl = this.approval.attachment_name;
			this.checkIfCommiteeExit();
			if (this.approval.committee_id != null) {
				this.getCommitteeUsers(false);
			}
		}, error => {
		});
	}

	getCommitteeUsers(commiteeChanged) {
		if (this.meetingCommitteeId == null) {
			this.committeeUsers = [];
			this.approval.members = commiteeChanged ? [] : this.approval.members;
			if (this.approval.committee_id) {
				this._crudService.getList<User>('admin/committees/' + this.approval.committee_id + '/committee-users').subscribe(res => {
					this.committeeUsers = res;
					this.checkIfUsersExit();
				}, error => {
				});
			}
		}
	}



	fileChangeEvent(event: any): void {
		this.approvalSizeError = '';
		this.fileTypeError = false;
		if (event.target.files[0]) {
			const extension = event.target.files[0].name.split('.');
			this.docuemntChangedEvent = event.target.files[0];
			this.approvalUrl = event.target.files[0].name;
			this.fileTypeError = (this.fileExtensions.includes(extension[extension.length - 1].toLowerCase())) ? false : true;
		} else {
			this.approvalUrl = null;
			this.docuemntChangedEvent = null;
		}

	}

	hasError(approvalDocForm: NgForm, field: string, validation: string) {
		if (approvalDocForm && Object.keys(approvalDocForm.form.controls).length > 0 && approvalDocForm.form.controls[field] &&
			approvalDocForm.form.controls[field].errors && validation in approvalDocForm.form.controls[field].errors) {
			if (validation) {
				return (approvalDocForm.form.controls[field].dirty &&
					approvalDocForm.form.controls[field].errors[validation]) || (this.edit && approvalDocForm.form.controls[field].errors[validation]);
			}
			return (approvalDocForm.form.controls[field].dirty &&
				approvalDocForm.form.controls[field].invalid) || (this.edit && approvalDocForm.form.controls[field].invalid);
		}
	}




	save(approvalDocForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		if (approvalDocForm.valid && !this.fileTypeError) {
			if (this.approvalId) { // edit
				if (this.docuemntChangedEvent) {
					this.fileUploader();
					forkJoin([this.approvalUrlObs]).subscribe(data => {
						this.approval.attachment_url = data[0].url;
						this.approval.attachment_name = this.approvalUrl;
						this.updateApproval();
					}, error => {
						this.approvalSizeError = this.translate.instant('APPROVAL.VALIDATION.SIZE_ERROR');
						this.submitted = false;
					});
				} else {
					this.updateApproval();
					// this.tabChanged.emit('TAB2');
				}
			} else { // add
				this.fileUploader();
				forkJoin([this.approvalUrlObs]).subscribe(data => {
					this.approval.attachment_url = data[0].url;
					this.approval.attachment_name = this.approvalUrl;
					this.addApproval();
				}, error => {
					this.approvalSizeError = this.translate.instant('APPROVAL.VALIDATION.SIZE_ERROR');
					this.submitted = false;
				});
			}
		} else {
			this.submitted = false;
		}
	}

	fileUploader() {
		this.approvalUrlObs = this._uploadService.uploadApprovalDocument<File>(this.docuemntChangedEvent);
	}

	updateApproval() {
		let result;
		if (this.meetingId != null) {
			this._meetingService.updateApprovalToMeeting<any>(this.meetingId, this.approvalId, this.approval).subscribe({
				next: (res) => {
					this.layoutUtilsService.showActionNotification(this.isArabic ? res.message.message_ar : res.message.message, MessageType.Create);
					this.submitted = false;
					result = res;
				}, error: (err) => {
					this.submitted = false;
					this.layoutUtilsService.showActionNotification(this.isArabic ? err.error_ar : err.error, MessageType.Create);
				}, complete: () => {
					this.modalTabChange.emit({ id: result.Results.id, TabId: 'setSignatureAreas' });
				},
			});
		} else {
			this._crudService.edit<any>('admin/approvals', this.approval, this.approvalId).subscribe({
				next: (res) => {
					this.layoutUtilsService.showActionNotification(this.isArabic ? res.message.message_ar : res.message.message, MessageType.Create);
					this.submitted = false;
					result = res;
				}, error: (err) => {
					this.submitted = false;
					this.layoutUtilsService.showActionNotification(this.isArabic ? err.error_ar : err.error, MessageType.Create);
				}, complete: () => {
					this.redirect(result.Results.id);
				}
			});
		}
	}

	addApproval() {
		let response;
		if (this.meetingId != null) {
			this._meetingService.addApprovalToMeeting<any>(this.meetingId, this.approval).subscribe({
				next: (res) => {
					// this.layoutUtilsService.showActionNotification(this.isArabic? res.message_ar : res.message, MessageType.Create);
					this.submitted = false;
					response = res;
				}, error: (err) => {
					this.submitted = false;
					// this.layoutUtilsService.showActionNotification(err.error, MessageType.Create);
				},
				complete: () => {
					this.modalTabChange.emit({ id: response.id, TabId: 'setSignatureAreas' });
				}
			});
		} else {
			this._crudService.add<any>('admin/approvals', this.approval).subscribe({
				next: (res) => {
					// this.layoutUtilsService.showActionNotification(this.isArabic? res.message_ar : res.message, MessageType.Create);
					this.submitted = false;
					response = res;
				}, error: (err) => {
					this.submitted = false;
					// this.layoutUtilsService.showActionNotification(err.error, MessageType.Create);
				}, complete: () => {
					this.redirect(response.id);
				}
			});
		}
	}

	redirect(approvalID) {
		this.router.navigate(['/approvals/edit/' + approvalID]);
		this.tabChanged.emit('TAB2');
		// this.router.navigate(["/prepare/create-approval/add-fields", approvalID]);
	}
	back() {
		if (this.meetingCommitteeId != null) {
			this._modal.dismissAll();
		} else {
			this.router.navigate(["/approvals"]);
		}
	}


	checkIfCommiteeExit() {
		let commiteeIndex = this.committees.findIndex(committee => committee.id == this.approval.committee_id);
		if (commiteeIndex == -1 && this.approval.committee_id != null) {
			this._crudService.get<Committee>('admin/committees', this.approval.committee_id).subscribe(res => {
				let committee = new Committee();
				committee.id = res['Results'].id;
				committee.committee_name_ar = res['Results'].committee_name_ar;
				committee.committee_name_en = res['Results'].committee_name_en;
				this.committees.push(committee);
			});
		}
	}

	checkIfUsersExit() {
		this.approval.members.forEach(reviewer => {
			let reviewerIndex = this.committeeUsers.findIndex(user => user.id == reviewer);
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
