

import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalRef, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, Subject, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// Models
import { Committee } from '../../../../core/models/committee';
import { User } from '../../../../core/models/user';

// Services
import { attachment } from '../../../../core/config/attachment';
import { CommitteeStatus } from '../../../../core/models/committee-status';
import { CommitteeType } from '../../../../core/models/committee-type';
import { CommitteeUserRequest } from '../../../../core/models/committee-user-request';
import { CommitteeTypeEnum } from '../../../../core/models/enums/committee-Types';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { EnvironmentVariableService } from '../../../../core/services/enviroment-variable/enviroment-variable.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { UserService } from '../../../../core/services/security/users.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { AddFinalOutputFileComponent } from '../add-final-output-file/add-final-output-file.component';
import { CommitteeRecommendationComponent } from '../committee-recommendation/committee-recommendation.component';
import { UnfreezeCommitteeComponent } from '../unfreeze-committee/unfreeze-committee.component';
import { environment } from './../../../../../environments/environment';
import { EvaluateMemberModalComponent } from '../evaluate-member-modal/evaluate-member-modal.component';
import { DisclosureCommitteeUserModalComponent } from '../disclosure-committee-user-modal/disclosure-committee-user-modal.component';
import { LdapUsersService } from '../../../../core/services/ldap-users/ldap-users.service';
import { CommitteeStatusEnum } from '../../../../core/models/enums/committee-status';
import { CommitteeNature } from '../../../../core/models/committee-nature';


@Component({
	selector: 'm-committee',
	templateUrl: './committee.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class CommitteeComponent implements OnInit {
	committee = new Committee();
	submitted: boolean = false;
	committeeId: number;
	committeeName: string;
	edit: boolean = false;
	isEdit:boolean=false;
	errors: Array<String>;
	users: Array<User> = [];
	memberUserSelectet: boolean = false;
	member_users: Array<User> = [];

	displayedColumns = ['name', 'email','committee_user_start_date', 'committee_user_expired_date', 'actions'];
	displayedColumnsNewSetting = ['name', 'email', 'status','committee_user_start_date', 'committee_user_expired_date','member_evaluation', 'actions'];
	recommendationDisplayedColumns = ['recommendation_body', 'recommendation_date', 'responsible_user', 'responsible_party', 'committee_final_output_id', 'actions'];

	@ViewChild('instance') instance: NgbTypeahead;
	focus$ = new Subject<string>();
	click$ = new Subject<string>();

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	paginatorTotal$: Observable<number>;
	pageSize = environment.pageSize;
	isArabic: boolean;
	message: string = '';
	messageOrganiser: string = '';
	error: Array<any>;
	startDateModel: any;
	expiredDateModel: any;
	decisionDateModel: any;
	isDateError: boolean = false;
	attachmentUrl: string;
	attachmentTypeError: boolean = false;
	attachmentExtensions: Array<String> = ['jpeg', 'jpg', 'png', 'doc', 'docx', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];
	attachmentSizeError: string = '';
	attachmentChangedEvent: any;
	governanceRegulationUrlObs: Observable<any>;

	customSettingObs: Observable<any>;
	committeeHasNatureFeatureObs: Observable<any>;

	LdapSettingObs: Observable<any>;
	customSetting: boolean;
	committeeHasNatureFeature: boolean;
	removeCommitteeCode: boolean;
	committeeStatus: Array<CommitteeStatus> = [];
	committeeTypes: Array<CommitteeType> = [];
	committeeNatures: Array<CommitteeNature> = [];

	committeeStatusObs: Observable<CommitteeStatus[]>;
	committeeTypeObs: Observable<CommitteeType[]>;
	committeeNatureObs: Observable<CommitteeNature[]>;

	committeeStatuesBindLabel: string = 'committee_status_name_en';
	committeeTypesBindLabel: string = 'committee_type_name_en';
	committeeNaturesBindLabel: string = 'committee_nature_name_en';
	attachmentDecisionUrl: string;
	attachmentDecisionUrlObs: Observable<any>;
	attachmentDecisionChangedEvent: any;
	committeeTypeEnum = CommitteeTypeEnum;
	committeeStatusEnum = CommitteeStatusEnum;
	selectedCommitteeTypeId: number;
	showDatesFields: boolean;
	customSettingDeleteObs: Observable<any>;
	customSettingDelete: boolean;
	customSettingWorkDone: boolean;
	customSettingWorkDoneObs: Observable<any>;
	usersCommitteeCombinedArray:any[];
	addUserFeatureSettingObs: Observable<any>;
	addUserFeatureSetting: boolean;
	committeeUsersRequestObs: Observable<CommitteeUserRequest[]>;
	committeeUsersRequest: Array<any> = [];
	messageResponsible: string = '';
	attachmentDecisionTypeError: boolean = false;
	attachmentDecisionSizeError: string = '';
	evaluationList:any;
	modalReference: NgbModalRef;
	closeResult: string;
	canExport: boolean;

	ldapSetting: boolean;
	constructor(
		private _crudService: CrudService,
		private route: ActivatedRoute,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _userService: UserService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		private _environmentVariableService: EnvironmentVariableService,
		private _modalService: NgbModal,
		private _uploadService: UploadService,
		private _committeeService: CommitteeService,
		private _ldapUsersService: LdapUsersService,

	) {

	}

	ngOnInit() {
		this.getLanguage();
		this.getCommitteeLookups();
		this._committeeService.getRemoveCommitteeCodeFeatureVariable().subscribe(
			res => {
				this.removeCommitteeCode = res.removeCommitteeCodeField;
			}
		)
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.committeeId = +params['id']; // (+) converts string 'id' to a number
				this.isEdit=true;
				this.getCommittee();
			}
		});
		if (this.committeeId) {
			this.getCommitteeUsersRequests();
		}
		this.committee.isFreezed = false;

		this.getAllEvaluations();

	}



	getAllEvaluations()
	{
		this._crudService.getList(`admin/evaluations`).subscribe(
			(data) => {
				this.evaluationList=data;
			},
			(error) => {
			}
		);
	}

	open(user) {


			const modelRef = this._modalService.open(EvaluateMemberModalComponent, {
				centered: true, size: 'lg', backdrop: 'static', keyboard: false
			});
			modelRef.componentInstance.user = user;
			modelRef.componentInstance.evaluationList = this.evaluationList;
			modelRef.result.then(
				(result) => {
					this.closeResult = `Closed with: ${result}`;
				},
				(reason) => {
					this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
				}
			);

	}

	openDisclosure(user) {
		const modelRef = this._modalService.open(DisclosureCommitteeUserModalComponent, {
			centered: true, size: 'lg', backdrop: 'static', keyboard: false
		});
		modelRef.componentInstance.user = user;
		modelRef.componentInstance.evaluationList = this.evaluationList;
		modelRef.result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
				this.getCommittee();
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
	getCommitteeUsersRequests() {
		this._committeeService.getCommitteeUserRequests(this.committeeId).subscribe((res) => {
			this.committeeUsersRequest = res.map(item => item['request_body']);
			if (this.addUserFeatureSetting) {
				this.updateUsersCommitteeCombinedArray();
			}
		}
			,
			error => {
			});
	}
	getCommittee() {
		this._crudService.get<Committee>('admin/committees', this.committeeId).subscribe(
			res => {
				this.committee = res['Results'];
				this.canExport = res['CanExport'];
				this.committeeName = res.committee_name_en;
				this.committee.isFreezed = Boolean(res.isFreezed)
				this.formatDate('object');
				this.committee.member_users.forEach(member => {
					if (member.id === this.committee.committee_head.id) {
						member.is_head = true;
					}
				});
				if (this.committee.member_users.length !== 0) {
					this.memberUserSelectet = true;
				}
				if (this.committee.has_recommendation_section != null) {
					this.committee.has_recommendation_section = !!this.committee.has_recommendation_section;
				}
				if (this.committee.governance_regulation_url) {
					this.attachmentUrl = this.translate.instant('COMMITTEES.ADD.GOVERNANCE_REGULATION') + '.' + this.committee.governance_regulation_url.split('.').pop();
				}
				if (this.committee.decision_document_url) { //new setting
					this.attachmentDecisionUrl = this.translate.instant('COMMITTEES.ADD.DECISIONDOCUMENT') + '.' + this.committee.decision_document_url.split('.').pop();
				}
				this.member_users = JSON.parse(JSON.stringify(this.committee.member_users));
				if (this.addUserFeatureSetting) {
					this.updateUsersCommitteeCombinedArray();
				}
			},
			error => {
			});
	}

	addCommitteeMember(id: any) {
		const _title: string = 'Committee Member';
		const _description: string = 'Select Member';
		const _waitDesciption: string = 'Member selected...';
		const _deleteMessage = `Member has been deleted`;

		const dialogRef = this.layoutUtilsService.addCommitteeMemberElement(_title, _description, _waitDesciption);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
		});
	}

	redirect() {
		this.router.navigate(['/committees']);
	}

	hasError(committeeForm: NgForm, field: string, validation: string) {
		if (committeeForm && Object.keys(committeeForm.form.controls).length > 0 &&
			committeeForm.form.controls[field]?.errors && validation in committeeForm.form.controls[field].errors) {
			if (validation) {
				return (committeeForm.form.controls[field].dirty &&
					committeeForm.form.controls[field].errors[validation]) || (this.edit && committeeForm.form.controls[field].errors[validation]);
			}
			return (committeeForm.form.controls[field].dirty &&
				committeeForm.form.controls[field].invalid) || (this.edit && committeeForm.form.controls[field].invalid);
		}
	}

	save(committeeForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		this.error = [];
		this.validateDates();
		this.validateFile();
		if (committeeForm.valid && typeof (this.committee.committee_head) !== 'string' && !this.isDateError
			&& !this.attachmentTypeError && this.attachmentSizeError.length == 0
			&& !this.attachmentDecisionTypeError && this.attachmentDecisionSizeError.length == 0
		) { // submit form if valid
			this.formatDate('string');
			if (this.committeeId) { // if edit
				if (this.attachmentChangedEvent && this.attachmentDecisionChangedEvent) {
					this.uploadGovernanceRegulation(this.attachmentChangedEvent);
					this.uploadDecisionDocument(this.attachmentDecisionChangedEvent);
					forkJoin(this.governanceRegulationUrlObs, this.attachmentDecisionUrlObs).subscribe(
						data => {
							this.committee.governance_regulation_url = data[0].url;
							this.committee.decision_document_url = data[1].url;
							this.updateCommittee();
						}, error => {
							this.submitted = false;
						});
				}
				else if (this.attachmentChangedEvent) {
					this.uploadGovernanceRegulation(this.attachmentChangedEvent);
					forkJoin(this.governanceRegulationUrlObs).subscribe(data => {
						this.committee.governance_regulation_url = data[0].url;
						this.updateCommittee();
					}, error => {
						this.submitted = false;
					});
				}
				else if (this.attachmentDecisionChangedEvent) {//new setting
					this.uploadDecisionDocument(this.attachmentDecisionChangedEvent);
					forkJoin(this.attachmentDecisionUrlObs).subscribe(data => {
						this.committee.decision_document_url = data[0].url;
						this.updateCommittee();
					}, error => {
						this.submitted = false;
					});
				}
				else {
					this.updateCommittee();
				}
			} else { // if add
				this.addCommittee();
			}
		} else {
			this.submitted = false;
		}
	}

	getSearchForUsers(userName) {
		let user_name = '';
		if (typeof (userName) === 'string') {
			user_name = userName;
			if (userName.length === 0) {
				this.message = '';
			} else {
				this.message = this.translate.instant('COMMITTEES.ADD.COMMITTEE_HEAD_ERROR');
			}
			this.checkHeadSelectedBefor('string');
		} else if (this.committee.committee_head) {
			this.message = '';
			user_name = this.committee.committee_head.name;
			this.committee.committee_head.is_head = true;
			// check if head selected before
			this.checkHeadSelectedBefor('object');
		}

	}

	private searchForUsersInLdap(userName: string): Observable<any> {
		const encodedUserName = encodeURIComponent(userName);
		const requestBody = { userName: encodedUserName }
		return this._ldapUsersService.getLdapUser(requestBody);
	}
	getSearchForCommitteeOrganisers(userName) {
		let user_name = '';
		if (typeof (userName) === 'string') {
			user_name = userName;
			if (userName.length === 0) {
				this.messageOrganiser = '';
			} else {
				this.messageOrganiser = this.translate.instant('COMMITTEES.ADD.COMMITTEE_ORGANISER_ERROR');
			}
		} else if (this.committee.committee_organiser) {
			this.messageOrganiser = '';
			user_name = this.committee.committee_organiser.name;
			this.committee.committee_organiser.is_organiser = true;
		}
	}

	getSearchUsers(username) {
		this._userService.getMatchedOrganizationUsers({ name: username }).subscribe(res => {
			this.users = res;
		}, error => {

		});
	}

	delete(user: User) {
		const key = this.member_users.findIndex(function (value: any) { return value.id === user.id; });
		if (key > -1) {
			this.member_users.splice(key, 1);
		}
		this.committee.member_users = JSON.parse(JSON.stringify(this.member_users));
		if (this.committee.member_users.length === 0) {
			this.memberUserSelectet = false;
		}
		this.updateUsersCommitteeCombinedArray();
	}

	search = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			switchMap(term => term === '' ? []
				: this._userService.getMatchedOrganizationUsers({ name: term })
			)
		)
	formatter = (user: any) => {
		if (this.isArabic === true) {
			if (user.name_ar) {
				return user.name_ar;
			} else {
				return user.name;
			}
		} else {
			if (user.name) {
				return user.name;
			} else {
				return user.name_ar;
			}
		}
	}

	addMember(data) {

		if (this.addUserFeatureSetting && this.committeeId) //edit mode
		{
			this.committeeUsersRequest = data;
			this.committeeUsersRequest = JSON.parse(JSON.stringify(data));
			this.getCommitteeUsersRequests();
		}
		else {
			this.committee.member_users = data;
			this.member_users = JSON.parse(JSON.stringify(data));
			if (this.committee.member_users.length !== 0) {
				this.memberUserSelectet = true;
			}
			this.usersCommitteeCombinedArray = this.committee.member_users
		}
	}

	private updateUsersCommitteeCombinedArray() {
		this.usersCommitteeCombinedArray = this.committee.member_users.map(user => ({ ...user, source: 'committeeUser' }))
			.concat(this.committeeUsersRequest.map(item => ({ ...item, source: 'userRequest' })));
	}
	checkHeadSelectedBefor(headName) {
		let headIndex = -1;
		this.member_users.forEach((member, index) => {
			if (member.is_head === true) {
				headIndex = index;
			}
		});
		if (headIndex > -1) {
			this.member_users.splice(headIndex, 1);
		}
		if (headName === 'object') {
			const headId = this.committee.committee_head.id;
			const hedIndex = this.member_users.findIndex(function (value: any) { return value.id === headId; });
			if (hedIndex === -1) {
				this.member_users.push(this.committee.committee_head);

			} else {
				this.member_users[hedIndex].committee_user_start_date = null;
				this.member_users[hedIndex].committee_user_expired_date = null;
				this.member_users[hedIndex].is_head = true;
			}
		}
		this.committee.member_users = JSON.parse(JSON.stringify(this.member_users));
		if (this.committee.member_users.length === 0) {
			this.memberUserSelectet = false;
		} else {
			this.memberUserSelectet = true;
		}
		if (this.addUserFeatureSetting) {
			this.updateUsersCommitteeCombinedArray();
		}
	}


	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	decideClosure(event, datepicker) {
		const path = event.composedPath().map(p => p.localName);
		if (!path.includes('ngb-datepicker')) {
			datepicker.close();
		}
	}

	formatDate(type) {
		if (type == 'object') {
			if (this.committee.committee_start_date) {
				const startDate = new Date(this.committee.committee_start_date);
				this.startDateModel = { day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear() };
			}
			if (this.committee.committee_expired_date) {
				const endDate = new Date(this.committee.committee_expired_date);
				this.expiredDateModel = { day: endDate.getDate(), month: endDate.getMonth() + 1, year: endDate.getFullYear() };
			}
			if (this.committee.decision_date) {
				const decisionDate = new Date(this.committee.decision_date);
				this.decisionDateModel = { day: decisionDate.getDate(), month: decisionDate.getMonth() + 1, year: decisionDate.getFullYear() };
			}
		} else {
			if (this.startDateModel) {
				this.committee.committee_start_date = this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' 00:00:00';
			} else {
				this.committee.committee_start_date = null;
			}
			if (this.expiredDateModel) {
				this.committee.committee_expired_date = this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day + ' 00:00:00';
			} else {
				this.committee.committee_expired_date = null;
			}
			if (this.decisionDateModel) {
				this.committee.decision_date = this.decisionDateModel.year + '-' + this.decisionDateModel.month + '-' + this.decisionDateModel.day + ' 00:00:00';
			} else {
				this.committee.decision_date = null;
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

	editUserData(data, user) {
		const index = this.committee.member_users.indexOf(user);
		this.committee.member_users[index] = data;
		if (this.addUserFeatureSetting) {
			this.updateUsersCommitteeCombinedArray();
		}
	}



	evaluateUserData( user,data) {
		console.log("data",data)
		const index = this.committee.member_users.indexOf(user);
		this.committee.member_users[index]["evaluation_id"] = data["evaluation"]["id"];
		console.log("memberuser",this.committee.member_users[index])
		this.committee.member_users[index]["evaluation_name_en"] = data["evaluation"]["evaluation_name_en"];
		this.committee.member_users[index]["evaluation_name_ar"] = data["evaluation"]["evaluation_name_ar"];
		this.committee.member_users[index]["evaluation_reason"] = data["evaluation"]["evaluation_reason"];

		if(this.addUserFeatureSetting)
		{
			this.updateUsersCommitteeCombinedArray();
		}
	}

	clearDate(type) {
		if (type == 'startDate') {
			this.startDateModel = null;
		}
		if (type == 'endDate') {
			this.expiredDateModel = null;
		}
		if (type == 'decisionDate') {
			this.decisionDateModel = null;
		}
		this.isDateError = false;
		this.validateDates();
	}

	fileChangeEvent(event: any): void {
		this.attachmentSizeError = '';
		this.attachmentTypeError = false;
		if (event.target.files[0]) {
			const extension = event.target.files[0].name.split('.');
			this.attachmentChangedEvent = event.target.files[0];
			this.attachmentUrl = event.target.files[0].name;
			this.attachmentTypeError = (this.attachmentExtensions.includes(extension[extension.length - 1].toLowerCase())) ? false : true;
		} else {
			this.attachmentUrl = null;
			this.attachmentChangedEvent = null;
		}
	}

	fileDecisionUrlChangeEvent(event: any): void {
		this.attachmentDecisionSizeError = '';
		this.attachmentDecisionTypeError = false;
		if (event.target.files[0]) {
			const extension = event.target.files[0].name.split('.');
			this.attachmentDecisionChangedEvent = event.target.files[0];
			this.attachmentDecisionUrl = event.target.files[0].name;
			this.attachmentDecisionTypeError = (this.attachmentExtensions.includes(extension[extension.length - 1].toLowerCase())) ? false : true;
		} else {
			this.attachmentDecisionUrl = null;
			this.attachmentDecisionChangedEvent = null;
		}
	}

	validateFile() {
		this.attachmentSizeError = '';
		const fileSize = this.attachmentChangedEvent ? (this.attachmentChangedEvent.size / 1000) : 0;
		if (fileSize > attachment.file_size) {
			this.attachmentSizeError = this.translate.instant('COMMITTEES.VALIDATION.File_SIZE_ERROR');
		} else if (this.attachmentChangedEvent && fileSize < attachment.min_file_size) {
			this.attachmentSizeError = this.translate.instant('COMMITTEES.VALIDATION.MIN_File_SIZE_ERROR');
		}
		else if (fileSize == 0 && this.attachmentChangedEvent) {
			this.attachmentSizeError = this.translate.instant('COMMITTEES.VALIDATION.File_ZERO_SIZE_ERROR');
		}
		// new setting
		if (this.customSetting) {
			this.attachmentDecisionSizeError = '';
			const decisionFileSize = this.attachmentDecisionChangedEvent ? (this.attachmentDecisionChangedEvent.size / 1000) : 0;
			if (decisionFileSize > attachment.file_size) {
				this.attachmentDecisionSizeError = this.translate.instant('COMMITTEES.VALIDATION.DECISION_File_SIZE_ERROR');
			} else if (this.attachmentDecisionChangedEvent && decisionFileSize < attachment.min_file_size) {
				this.attachmentDecisionSizeError = this.translate.instant('COMMITTEES.VALIDATION.MIN_DECISION_File_SIZE_ERROR');
			}
			else if (decisionFileSize == 0 && this.attachmentDecisionChangedEvent) {
				this.attachmentDecisionSizeError = this.translate.instant('COMMITTEES.VALIDATION.DECISION_File_ZERO_SIZE_ERROR');
			}
		}
	}

	uploadGovernanceRegulation(file: File) {
		if (file) {
			this.governanceRegulationUrlObs = this._uploadService.uploadCommitteeDocument<File>(file, this.committee.id);
		}
	}

	uploadDecisionDocument(file: File) {
		if (file) {
			this.attachmentDecisionUrlObs = this._uploadService.uploadCommitteeDocument<File>(file, this.committee.id);
		}
	}

	updateCommittee() {
		this._crudService.edit<Committee>('admin/committees', this.committee, this.committeeId).subscribe(data => {
			this.router.navigate(['/committees']);
		}, error => {
			this.submitted = false;
			this.error = error.error;
			if (error.error_code === 3) {
				this.errors = error.message;
			}
		});
	}

	addCommittee() {
		const formData: FormData = new FormData();
		if (this.attachmentChangedEvent != null) {
			formData.append('governanceRegulationFile', this.attachmentChangedEvent, this.attachmentChangedEvent.name);
		}
		if (this.attachmentDecisionChangedEvent != null) {
			formData.append('decisionDocumentFile', this.attachmentDecisionChangedEvent, this.attachmentDecisionChangedEvent.name);
		}
		formData.append('committee', JSON.stringify(this.committee));
		this._crudService.add<Committee>('admin/committees', formData).subscribe(data => {
			const _successMessage = this.translate.instant('COMMITTEES.ADD.ADDCOMMITTEEREQUESTSUCCESSMSG');
			this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
			this.router.navigate(['/committees']);
		}, error => {
			this.submitted = false;
			this.error = error.error;
			if (error.error_code === 3) {
				this.errors = error.message;
			}
		});
	}

	downloadFile() {
		this._uploadService.downloadFile(environment.imagesBaseURL + this.committee.governance_regulation_url).subscribe((res) => {
			const downloadURL = window.URL.createObjectURL(res);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = this.translate.instant('COMMITTEES.ADD.GOVERNANCE_REGULATION') + '.' + this.committee.governance_regulation_url.split('.').pop();
			link.click();
		});
	}

	unfreeze() {
		const modelRef = this._modalService.open(UnfreezeCommitteeComponent, {
			centered: true, size: 'lg', backdrop: 'static', keyboard: false
		});
		modelRef.componentInstance.committee = this.committee;
		modelRef.result.then(
			(result) => {
				if (result != null) {
					this.layoutUtilsService.showActionNotification(this.isArabic ? result['message'][0].message_ar : result['message'][0].message, MessageType.Delete);
					this.getCommittee();
				}
				this._modalService.dismissAll();
			}
		);
	}

	statusSearch = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			switchMap(term => term === '' ? []
				: this._userService.getMatchedOrganizationUsers({ name: term })
			)
		)

	getCommitteeLookups() {
		this.getCommitteeStatues();
		this.getCommitteeTypes();
		this.getCommitteeNatures();
		this.getAddCommitteeFeatureVariable();
		this.getAddUserFeatureVariable();
		this.getDeleteUserFeatureVariable();
		this.getWorkDoneFeatureVariable();
		this.getCommitteeHasNatureFeatureVariable();
		this.getLdapIntegrationFeatureVariable();
		forkJoin([this.committeeStatusObs, this.committeeTypeObs, this.customSettingObs,this.LdapSettingObs,this.customSettingDeleteObs,this.addUserFeatureSettingObs,this.customSettingWorkDoneObs
		,this.committeeNatureObs,this.committeeHasNatureFeatureObs])
			.subscribe(([committeeStatusRes, committeeTypesRes, customSettingRes,LdapSettingObs,customSettingDeleteRes,addUserFeatureSettingRes,customSettingWorkDoneRes,committeeNaturesRes,committeeHasNatureFeatureRes]) => {
				this.committeeStatus = committeeStatusRes;
				this.committeeTypes = committeeTypesRes;
				this.customSetting = customSettingRes.addCommitteeNewFields;
				this.ldapSetting=LdapSettingObs.ldapIntegration;
				this.customSettingDelete=customSettingDeleteRes.deleteUserFeature;
				this.addUserFeatureSetting=addUserFeatureSettingRes.addUserFeature;
				this.customSettingWorkDone=customSettingWorkDoneRes.workDoneByCommitteeFeature;
				this.committeeNatures=committeeNaturesRes;
				this.committeeHasNatureFeature= committeeHasNatureFeatureRes.committeeHasNatureFeature

			}
				,
				error => {
				});

	}

	addRecommendation() {
		const modelRef = this._modalService.open(CommitteeRecommendationComponent, {
			centered: true, size: 'lg', backdrop: 'static', keyboard: false
		});
		modelRef.componentInstance.committee = this.committee;
		modelRef.result.then(
			(result) => {
				this.layoutUtilsService.showActionNotification(
					this.isArabic ? result['Messages'].message_ar : result['Messages'].message,
					MessageType.Delete);
				this.getCommittee();
				this._modalService.dismissAll();
			}
		);
	}

	editRecommendationModal(recommend) {
		const modelRef = this._modalService.open(CommitteeRecommendationComponent, {
			centered: true, size: 'lg', backdrop: 'static', keyboard: false
		});
		modelRef.componentInstance.recommend = recommend;
		modelRef.componentInstance.committee = this.committee;
		modelRef.result.then(
			(result) => {
				this.layoutUtilsService.showActionNotification(
					this.isArabic ? result['Messages'].message_ar : result['Messages'].message,
					MessageType.Delete);
				this.getCommittee();
				this._modalService.dismissAll();
			}
		);
	}

	deleteRecommendationModal(id) {
		const _title: string = this.translate.instant('COMMITTEES.RECOMMENDATIONS.DELETE_RECOMMEND');
		const _description: string = this.translate.instant('COMMITTEES.RECOMMENDATIONS.DESCRIPTION');
		const _waitDescription: string = this.translate.instant('COMMITTEES.RECOMMENDATIONS.WAIT_DESCRIPTION');

		const dialogRef = this.layoutUtilsService.deleteElement(
			_title, _description,
			_waitDescription, this.translate.instant('BUTTON.DELETE')
		);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<Committee>('admin/recommendations', id).subscribe(
				result => {
					this.layoutUtilsService.showActionNotification(
						this.isArabic ? result['Messages'].message_ar : result['Messages'].message,
						MessageType.Delete
					);
					this.getCommittee();
				},
				error => {
					this.loadingSubject.next(false);
					if (this.isArabic) {
						this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);
					} else {
						this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);
					}
				}
			);
		});
	}

	getCommitteeStatues() {
		this.committeeStatusObs = this._crudService.getList('admin/committee-statuses')
	}
	getCommitteeTypes() {
		this.committeeTypeObs = this._crudService.getList('admin/committee-types')
	}

	getCommitteeNatures() {
		this.committeeNatureObs = this._crudService.getList('admin/committee-natures')
	}

	getAddCommitteeFeatureVariable() {
		this.customSettingObs = this._environmentVariableService.getAddCommitteeFeatureVariable();
	}
	getLdapIntegrationFeatureVariable() {
		this.LdapSettingObs = this._environmentVariableService.getLdapIntegrationFeatureVariable();
	}
	onCommitteeTypeSelection() {
		if (this.committee.committee_type.id == this.committeeTypeEnum.temporary) { this.showDatesFields = true; }
		else { this.showDatesFields = false; }
		this.committee.committee_type_id = this.committee.committee_type.id;
	}
	onCommitteeNatureSelection() {
		this.committee.committee_nature_id = this.committee.committee_nature.id;
	}
	downloadDecisionDocument() {
		this._uploadService.downloadFile(environment.imagesBaseURL + this.committee.decision_document_url).subscribe((res) => {
			const downloadURL = window.URL.createObjectURL(res);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = this.translate.instant('COMMITTEES.ADD.DECISION_DOCUMENT') + '.' + this.committee.decision_document_url.split('.').pop();
			link.click();
		});
	}

	getDeleteUserFeatureVariable() {
		this.customSettingDeleteObs = this._environmentVariableService.getDeleteUserFeatureVariable();
	}
	getAddUserFeatureVariable() {
		this.addUserFeatureSettingObs = this._environmentVariableService.getAddUserFeatureVariable();
	}

	getWorkDoneFeatureVariable()
	{
		this.customSettingWorkDoneObs=this._environmentVariableService.getWorkDoneFeatureVariable();
	}
	getCommitteeHasNatureFeatureVariable()
	{
		this.committeeHasNatureFeatureObs=this._environmentVariableService.getCommitteeHasNatureFeatureVariable();
	}

	getSearchForCommitteeResponsible(userName) {
		let user_name = '';
		if (typeof (userName) === 'string') {
			user_name = userName;
			if (userName.length === 0) {
				this.messageResponsible = '';
			} else {
				this.messageResponsible = this.translate.instant('COMMITTEES.ADD.COMMITTEE_RESPONSIBLE_ERROR');
			}
		} else if (this.committee.committee_responsible) {
			this.messageResponsible = '';
			user_name = this.committee.committee_responsible.name;
		}

	}

	exportCommittee() {
		this._committeeService.exportCommitteeData(this.committeeId).subscribe(
			res => {
					const downloadURL = window.URL.createObjectURL(res);
					const link = document.createElement('a');
					link.href = downloadURL;
					link.download =  `committee_${this.committeeId}.xlsx`;
					link.click();
			},
			error => {
		  	}
		)

	  }
	finalOutputModal() {
		const modelRef = this._modalService.open(AddFinalOutputFileComponent, {
			centered: true, size: 'lg', backdrop: 'static', keyboard: false
		});
		modelRef.componentInstance.committee = this.committee;
		modelRef.result.then(
			(result) => {
				this.layoutUtilsService.showActionNotification(
					this.isArabic ? result['Messages'].message_ar : result['Messages'].message,
					MessageType.Delete
				);
				this.getCommittee();
				this._modalService.dismissAll();
			}
		);
	}

	formatBytes(bytes, decimals = 2) {
		if (bytes === 0) { return '0 Bytes'; }

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

		const i = Math.floor(Math.log(bytes) / Math.log(k));
		const size = `${(bytes / Math.pow(k, i)).toFixed(dm)}${sizes[i]}`;
		return size;
	}

	downloadFinalOutput(id) {
		this._committeeService.downloadFinalOutput(id).subscribe(
			res => {
				const downloadURL = window.URL.createObjectURL(res);
				const link = document.createElement('a');
				link.href = downloadURL;
				link.download = (this.isArabic ?
					(this.committee.committee_name_ar ?? this.committee.committee_name_en)
					: (this.committee.committee_name_en ?? this.committee.committee_name_ar)) + '-final-output';
				link.click();
			}
		);
	}


	confirmationHasRecommendations(hasRecommendation: boolean) {
		/* const _title: string = this.translate.instant('MEETINGS.GENERAL.HAS_RECOMMENDATION');
		let _description: string;
		if (hasRecommendation) {
			_description = this.translate.instant('MEETINGS.GENERAL.HAS_RECOMMENDATION_YES_OPTION');
		} else {
			_description = this.translate.instant('MEETINGS.GENERAL.HAS_RECOMMENDATION_NO_OPTION');
		}
		const _waitDesciption: string = this.translate.instant('MEETINGS.GENERAL.HAS_RECOMMENDATION_WAITING');
		const _successMessage = this.translate.instant('MEETINGS.GENERAL.HAS_RECOMMENDATION_CONFIRM');

		const dialogRef = this.layoutUtilsService.meeingActions(
			_title, _description, _waitDesciption, this.translate.instant('BUTTON.CONFIRM')
		);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.submitted = false;
				return;
			}
			this._committeeService.updateCommitteeRecommendationsStatus(this.committee.id, hasRecommendation)
				.subscribe(pagedData => {
					this.submitted = false;
					if (pagedData['is_success'] === true) {
						this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
						this.getCommittee();
					} else {
						const errMsg = this.isArabic ? 'فشل فى طلبك' : 'Your request failed';
						this.layoutUtilsService.showActionNotification(errMsg, MessageType.Delete);
					}
				}, error => {
					this.submitted = false;
				});
		}); */
		this.committee.has_recommendation_section = hasRecommendation;
	}
	reminderCommitteeMembers() {
		this._committeeService.reminderCommitteeMembers(this.committee.id).subscribe(
			res => {
				this.layoutUtilsService.showActionNotification(this.isArabic ? res.Message[0].message_ar : res.Message[0].message);
			}, err => {

			}
		);
	}

	onSelectHead(item: any): void {
		if(item && this.ldapSetting)
		{
			this.searchForUsersInLdap(item.item.username).subscribe(
				(user: User) => {
					if (user.hasOwnProperty('id') && user.id !== undefined)
					{
						this.committee.committee_head = user;
						this.checkHeadSelectedBefor('object');
					}
				},
				(error) => {
				}
			);
		}
	}
	onSelectOrganizer(item: any): void {
		if(item && this.ldapSetting)
		{
			this.searchForUsersInLdap(item.item.username).subscribe(
				(user: User) => {
					if (user.hasOwnProperty('id') && user.id !== undefined)
					{
						this.committee.committee_organiser = user;
					}
				},
				(error) => {
				}
			);
		}
	}

	onSelectCommitteeResponsible(item: any): void {
		if(item && this.ldapSetting)
		{
			this.searchForUsersInLdap(item.item.username).subscribe(
				(user: User) => {
					if (user.hasOwnProperty('id') && user.id !== undefined)
					{
				  		this.committee.committee_responsible = user;
					}
				},
				(error) => {
				}
			);
		}
	}
}
