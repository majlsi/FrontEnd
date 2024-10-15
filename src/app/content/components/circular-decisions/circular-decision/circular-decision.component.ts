import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';

// RXJS
import { Observable, forkJoin } from 'rxjs';

// Models
import { Decision } from '../../../../core/models/decision';

// Material
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { DecisionType } from '../../../../core/models/decision-type';
import { Committee } from '../../../../core/models/committee';
import { User } from '../../../../core/models/user';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { NgForm } from '@angular/forms';
import { DropzoneComponent } from 'ngx-dropzone-wrapper';
import { attachment } from '../../../../core/config/attachment';
import { AttachmentType } from '../../../../core/models/attachment-type';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { Attachment } from '../../../../core/models/attachment';
import { VoteResultStatuses } from '../../../../core/models/enums/vote-result-statuses';
import { SharedAddSectionComponent } from '../../shared/shared-add-section/shared-add-section.component';

@Component({
	selector: 'm-circular-decision',
	templateUrl: './circular-decision.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class CircularDecisionComponent implements OnInit {

	decision = new Decision();
	submitted: boolean = false;
	decisionId: number;
	edit: boolean = false;
	errors: Array<String>;
	committees: Array<Committee> = [];
	committeesObs: Observable<Committee[]>;
	isArabic: boolean;
	committeeUsers: Array<User> = [];
	committeeLabel: string = 'committee_name_ar';
	userLabel: string = 'name_ar';
	startDateModel: any;
	endDateModel: any;
	startTimeModel: any;
	endTimeModel: any;
	timeToError = false;
	activeTab: string;
	decisionTypeBindLabel: string;
	decisionTypes: Array<DecisionType> = [];
	decisionTypesObs: Observable<DecisionType[]>;
	_startTimemeridian = true;
	_endTimemeridian = true;
	fileSizeError: string = '';
	fileTypeError: string = '';
	files: Array<File> = [];
	@ViewChild(DropzoneComponent) componentRef?: DropzoneComponent;
	attachmentType = new AttachmentType();
	attachmentsObs: Observable<any>;
	filesOdsArray: Array<Observable<any>> = [];
	voteResultStatusesEnum = VoteResultStatuses;

	attachments = [];
	@ViewChild(SharedAddSectionComponent) SharedAddSectionComponent?: SharedAddSectionComponent;

	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private committeeService: CommitteeService,
		private _translationService: TranslationService,
		private _uploadService: UploadService) { }

	ngOnInit() {
		this.startTimeModel = { hour: 12, minute: 0, second: 0 };
		this.endTimeModel = { hour: 13, minute: 0, second: 0 };
		this.getLanguage();
		this.getUserCommittees();
		this.getDecisionTypes();
		this.route.params.subscribe(params => {
			forkJoin([this.committeesObs, this.decisionTypesObs])
				.subscribe(data => {
					this.committees = data[0];
					this.decisionTypes = data[1];
					if (params['id']) {
						this.decisionId = +params['id']; // (+) converts string 'id' to a number
						this.getDecision();
					}
				},
					error => {
					});
		});
		this.route.queryParams.subscribe((queryParams) => {
			if (queryParams.activeTab) {
				this.activeTab = queryParams.activeTab;
			}
		});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		this.committeeLabel = this.isArabic ? 'committee_name_ar' : 'committee_name_en';
		this.userLabel = this.isArabic ? 'name_ar' : 'name';
		this.decisionTypeBindLabel = this.isArabic ? 'decision_type_name_ar' : 'decision_type_name_en';
	}

	getDecisionTypes() {
		this.decisionTypesObs = this._crudService.getList<DecisionType>('admin/decision-types');
	}

	getUserCommittees() {
		this.committeesObs = this.committeeService.getUserCommittees<Committee>();
	}

	getDecision() {
		this._crudService.get<Decision>('admin/circular-decisions', this.decisionId).subscribe(res => {
			this.decision = res;
			this.checkIfCommiteeExit();
			this.formatDate('object');
			this.getCommitteeUsers(false);
			this.attachments = [...this.decision.attachments];
		});
	}


	getCommitteeUsers(commiteeChanged) {
		this.committeeUsers = [];
		this.decision.vote_users_ids = commiteeChanged ? [] : this.decision.vote_users_ids;
		if (this.decision.committee_id) {
			this._crudService.getList<User>('admin/committees/' + this.decision.committee_id + '/committee-users').subscribe(res => {
				this.committeeUsers = res;
				if (commiteeChanged) {
					this.decision.vote_users_ids = this.committeeUsers.map(a => a.id);
				} else {
					this.checkIfUsersExit();
				}
			}, error => {
			});
		}
	}

	formatDate(type) {
		if (type == 'object') {
			const startDate = new Date(this.decision.vote_schedule_from);
			const endDate = new Date(this.decision.vote_schedule_to);

			this.startDateModel = { day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear() };
			this.endDateModel = { day: endDate.getDate(), month: endDate.getMonth() + 1, year: endDate.getFullYear() };
			this.startTimeModel = { hour: startDate.getHours(), minute: startDate.getMinutes(), second: 0 };
			this.endTimeModel = { hour: endDate.getHours(), minute: endDate.getMinutes(), second: 0 };
		} else {
			this.decision.vote_schedule_from = this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' ' + this.startTimeModel.hour + ':' + this.startTimeModel.minute + ':00';
			this.decision.vote_schedule_to = this.endDateModel.year + '-' + this.endDateModel.month + '-' + this.endDateModel.day + ' ' + this.endTimeModel.hour + ':' + this.endTimeModel.minute + ':00';
		}
	}

	hasError(decisioncForm: NgForm, field: string, validation: string) {
		if (decisioncForm && Object.keys(decisioncForm.form.controls).length > 0 && decisioncForm.form.controls[field] &&
			decisioncForm.form.controls[field].errors && validation in decisioncForm.form.controls[field].errors) {
			if (validation) {
				return (decisioncForm.form.controls[field].dirty &&
					decisioncForm.form.controls[field].errors[validation]) || (this.edit && decisioncForm.form.controls[field].errors[validation]);
			}
			return (decisioncForm.form.controls[field].dirty &&
				decisioncForm.form.controls[field].invalid) || (this.edit && decisioncForm.form.controls[field].invalid);
		}
	}

	decideClosure(event, datepicker) {
		const path = event.composedPath().map(p => p.localName);
		if (!path.includes('ngb-datepicker')) {
			datepicker.close();
		}
	}

	redirect() {
		this.router.navigate(['/circular-decisions'], { queryParams: { activeTab: this.activeTab } });
	}

	changeTime() {
		if (this.startTimeModel && this.endTimeModel && this.startDateModel && this.endDateModel) {
			let startDate;
			let endDate;
			startDate = new Date(this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' ' + this.startTimeModel.hour + ':' + this.startTimeModel.minute + ':' + this.startTimeModel.second);
			endDate = new Date(this.endDateModel.year + '-' + this.endDateModel.month + '-' + this.endDateModel.day + ' ' + this.endTimeModel.hour + ':' + this.endTimeModel.minute + ':' + this.endTimeModel.second);
			if (startDate > endDate) {
				this.timeToError = true;
			} else {
				this.timeToError = false;
			}
		} else {
			this.timeToError = false;
		}
	}

	save(decisioncForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		this.fileSizeError = '';
		this.fileTypeError = '';
		if (!(this.decision.vote_result_status_id && this.decision.vote_result_status_id != this.voteResultStatusesEnum.noVotesYet)) {
			this.files = this.SharedAddSectionComponent.files;
		}
		const attachmentsLength = this.attachments.length;
		const attachmentsObject = [... this.attachments];
		this.validateFiles();
		this.changeTime();
		if (decisioncForm.valid && this.timeToError === false && this.fileSizeError.length === 0 && this.fileTypeError.length === 0) {
			this.formatDate('string');
			this.decision.attachments = [];

			if (this.decisionId) { // edit
				if (this.files.length !== 0) {
					this.filesUploader(this.files);
					forkJoin([this.attachmentsObs]).subscribe(data => {
						data[0].urls.forEach((url, index) => {
							attachmentsObject[attachmentsLength + index] = new Attachment();
							attachmentsObject[attachmentsLength + index].attachment_url = url;
							attachmentsObject[attachmentsLength + index].attachment_name = this.files[index].name;
						});
						this.setDecisionAttachemnts(attachmentsObject);
						this.updateDecision();
					}, error => {
						if (error && error.error[0]) {
							if (this.isArabic) {
								this.layoutUtilsService.showActionNotification(error.error[0][0].message_ar, MessageType.Delete);

							} else {
								this.layoutUtilsService.showActionNotification(error.error[0][0].message, MessageType.Delete);
							}
						} else {
							this.fileSizeError = this.translate.instant('CIRCULAR_DECISIONS.VALIDATION.File_SIZE_ERROR');
						}

						this.submitted = false;
					});
				} else {
					this.setDecisionAttachemnts(attachmentsObject);
					if (this.decision.vote_result_status_id && this.decision.vote_result_status_id != this.voteResultStatusesEnum.noVotesYet) {
						delete this.decision.attachments;
					}
					this.updateDecision();
				}
			} else { // add
				if (this.files.length !== 0) {
					this.filesUploader(this.files);
					forkJoin([this.attachmentsObs]).subscribe(data => {
						data[0].urls.forEach((url, index) => {
							attachmentsObject[attachmentsLength + index] = new Attachment();
							attachmentsObject[attachmentsLength + index].attachment_url = url;
							attachmentsObject[attachmentsLength + index].attachment_name = this.files[index].name;
						});
						this.setDecisionAttachemnts(attachmentsObject);
						this.addDecision();
					}, error => {
						if (error && error.error[0]) {
							if (this.isArabic) {
								this.layoutUtilsService.showActionNotification(error.error[0][0].message_ar, MessageType.Delete);

							} else {
								this.layoutUtilsService.showActionNotification(error.error[0][0].message, MessageType.Delete);
							}
						} else {
							this.fileSizeError = this.translate.instant('CIRCULAR_DECISIONS.VALIDATION.File_SIZE_ERROR');
						}
						this.submitted = false;
					});
				} else {
					this.setDecisionAttachemnts(attachmentsObject);
					this.addDecision();
				}
			}
		} else {
			this.submitted = false;
		}
	}

	setDecisionAttachemnts(data) {
		this.decision.attachments = [...data];
	}

	updateDecision() {
		this._crudService.edit<any>('admin/circular-decisions', this.decision, this.decisionId).subscribe(res => {
			this.layoutUtilsService.showActionNotification(this.translate.instant('CIRCULAR_DECISIONS.ADD.EDIT_MESSAGE'), MessageType.Create);
			this.submitted = false;
			this.redirect();
		}, error => {
			this.submitted = false;
			this.layoutUtilsService.showActionNotification(error.error, MessageType.Create);
		});
	}

	addDecision() {
		this._crudService.add<any>('admin/circular-decisions', this.decision).subscribe(res => {
			this.layoutUtilsService.showActionNotification(this.translate.instant('CIRCULAR_DECISIONS.ADD.MESSAGE'), MessageType.Create);
			this.submitted = false;
			this.redirect();
		}, error => {
			this.submitted = false;
			this.layoutUtilsService.showActionNotification(error.error, MessageType.Create);
		});
	}

	setEndDateEqualFrom() {
		if (this.endDateModel && this.endDateModel.year && this.endDateModel.month && this.endDateModel.day &&
			this.startDateModel && this.startDateModel.year && this.startDateModel.month && this.startDateModel.day) {
			const startDate = new Date(this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day);
			const endDate = new Date(this.endDateModel.year + '-' + this.endDateModel.month + '-' + this.endDateModel.day);
			if (startDate > endDate) {
				this.endDateModel = this.startDateModel;
			}
		}
	}

	changeIsSecret() {
	}

	validateFiles() {
		this.files.forEach((file, index) => {
			if ((file.size / 1000) >= attachment.file_size) {
				this.fileSizeError = this.translate.instant('CIRCULAR_DECISIONS.VALIDATION.File_SIZE_ERROR');
			} else if (file.size == 0) {
				this.fileSizeError = this.translate.instant('CIRCULAR_DECISIONS.VALIDATION.File_ZERO_SIZE_ERROR');
			}
			if (!this.attachmentType.filesType.includes(file.name.split('.').pop().toLocaleLowerCase())) {
				this.fileTypeError = this.translate.instant('CIRCULAR_DECISIONS.VALIDATION.File_TYPE_ERROR') + ': ';
				this.attachmentType.filesType.forEach((extension, index) => {
					if (index === (this.attachmentType.filesType.length - 1)) {
						this.fileTypeError += ' ' + extension;
					} else {
						this.fileTypeError += ' ' + extension + ',';
					}
				});
			}
		});
	}

	filesUploader(attachments: Array<File>) {
		if (attachments) {
			this.attachmentsObs = this._uploadService.uploadCircularDesisionAttachments<File>(attachments);
		}
	}

	checkIfCommiteeExit() {
		const commiteeIndex = this.committees.findIndex(committee => committee.id == this.decision.committee_id);
		if (commiteeIndex == -1) {
			this._crudService.get<Committee>('admin/committees', this.decision.committee_id).subscribe(res => {
				const committee = new Committee();
				committee.id = res['Results'].id;
				committee.committee_name_ar = res['Results'].committee_name_ar;
				committee.committee_name_en = res['Results'].committee_name_en;
				this.committees.push(committee);
			});
		}
	}

	checkIfUsersExit() {
		this.decision.voters.forEach(voter => {
			const voterIndex = this.committeeUsers.findIndex(user => user.id == voter.id);
			if (voterIndex == -1) {
				const committeeUser = new User();
				committeeUser.id = voter.id;
				committeeUser.name = voter.name;
				committeeUser.name_ar = voter.name_ar;
				this.committeeUsers.push(committeeUser);
			}
		});
	}
}
