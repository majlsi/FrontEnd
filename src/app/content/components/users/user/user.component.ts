import {Component, OnInit, ChangeDetectionStrategy, ViewChild, Input} from '@angular/core';
import {Params, ActivatedRoute, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {User} from '../../../../core/models/user';
import {CrudService} from '../../../../core/services/shared/crud.service';
import {Role} from './../../../../core/models/role';
import {Language} from './../../../../core/models/language';
import {forkJoin, Observable} from 'rxjs';
import {TranslationService} from '../../../../core/services/translation.service';
import {LayoutUtilsService, MessageType} from '../../../../core/services/layout-utils.service';
import {TranslateService} from '@ngx-translate/core';
import {UserTitle} from '../../../../core/models/user-title';
import {JobTitle} from '../../../../core/models/job-title';
import {Nickname} from '../../../../core/models/nickname';
import {EnvironmentVariableService} from '../../../../core/services/enviroment-variable/enviroment-variable.service';
import {MatDialog} from '@angular/material/dialog';
import {AddUserByNationalIdDialogComponent} from '../add-user-by-national-id-dialog/add-user-by-national-id-dialog.component';

@Component({
	selector: 'm-user',
	templateUrl: './user.component.html',
	changeDetection: ChangeDetectionStrategy.Default,
	styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
	user = new User();
	submitted: boolean = false;
	userId: number;
	edit: boolean = false;
	showError: boolean = false;
	rolesObs: Observable<Role[]>;
	additionalUserFieldsObs: Observable<Role[]>;
	additionalUserFields: boolean = false;
	languageObs: Observable<Language[]>;
	userTitleObs: Observable<UserTitle[]>;
	jobTitleObs: Observable<JobTitle[]>;
	nicknamesObs: Observable<Nickname[]>;
	errors: Array<String>;
	roles: Array<Role> = [];
	languages: Array<Language> = [];
	userTitles: Array<UserTitle> = [];
	jobTitles: Array<JobTitle> = [];
	nicknames: Array<Nickname> = [];
	isArabic: boolean;
	bindLabel: string = 'role_name_ar';
	bindLabelLang: string = 'language_name_ar';
	bindLabelUserTitle = 'user_title_name_ar';
	bindLabelJobTitle = 'job_title_name_ar';
	bindLabelNickname = 'nickname_ar';
	isSubmittedByFetcher: boolean = false;
	@Input() isParticipant: boolean;

	constructor(private _crudService: CrudService, private route: ActivatedRoute, private router: Router,
				private _translationService: TranslationService,
				private _environmentVariableService: EnvironmentVariableService,
				private layoutUtilsService: LayoutUtilsService,
				private dialog: MatDialog,
				private translate: TranslateService) {

	}

	ngOnInit() {
		this.getLanguage();
		this.getJobTitles();
		this.getUserTitles();
		this.getNicknames();
		this.getRoles();
		this.getLanguages();
		this.getAdditionalUserFieldsVariable();
		this.route.params.subscribe(params => {
			forkJoin([this.rolesObs, this.languageObs, this.userTitleObs, this.jobTitleObs, this.nicknamesObs, this.additionalUserFieldsObs])
				.subscribe(data => {
						this.roles = data[0];
						this.languages = data[1];
						this.userTitles = data[2];
						this.jobTitles = data[3];
						this.nicknames = data[4];
						this.additionalUserFields = data[5]['additionalUserFields'];
						if (!this.isParticipant) {
							this.roles = this.roles.filter(function (item) {
								return item.can_assign === 1;
							});
						} else {
							const participantRole = this.roles.filter(function (item) {
								return item.can_assign === 0;
							});
							this.user.role_id = participantRole[0].id;
						}
						if (params['id']) {
							this.userId = +params['id']; // (+) converts string 'id' to a number
							this._crudService.get<User>('users', this.userId).subscribe(
								res => {
									this.user = res;
								},
								error => {
									// console.log('error');
								});
						}
					},
					error => {
						// console.log('error');
					});
		});

	}

	redirect() {
		if (this.isParticipant) {
			this.router.navigate(['/participants']);
		} else {
			this.router.navigate(['/users']);
		}
	}

	hasError(userForm: NgForm, field: string, validation: string) {
		if (userForm && Object.keys(userForm.form.controls).length > 0 &&
			userForm.form.controls[field]?.errors && validation in userForm.form.controls[field].errors) {
			if (validation) {
				return (userForm.form.controls[field].dirty &&
					userForm.form.controls[field].errors[validation]) || (this.edit && userForm.form.controls[field].errors[validation]);
			}
			return (userForm.form.controls[field].dirty &&
				userForm.form.controls[field].invalid) || (this.edit && userForm.form.controls[field].invalid);
		}
	}

	save(userForm: NgForm) {
		this.submitted = true;
		this.edit = true;

		if (!userForm.valid && this.user.password === this.user.rpassword) { // submit form if valid
			if (this.userId) { // if edit
				this._crudService.edit<User>('users', this.user, this.userId).subscribe(
					data => {
						if (this.isParticipant) {
							const _successMessage = this.translate.instant('USERS.ADD.EDITPARTICIPANTSUCCESSMSG');
							this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
							this.router.navigate(['/participants']);
						} else {
							const _successMessage = this.translate.instant('USERS.ADD.EDITUSERSUCCESSMSG');
							this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
							this.router.navigate(['/users']);
						}
					},
					error => {
						this.submitted = false;
						if (typeof (error.error) === 'string') {
							this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Delete);
						} else {
							this.showError = true;
							this.errors = error.error[0];
						}
					});
			} else { // if add
				this._crudService.add<User>('users', this.user).subscribe(
					data => {
						if (this.isParticipant) {
							const _successMessage = this.translate.instant('USERS.ADD.ADDPARTICIPANTSUCCESSMSG');
							this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
							this.router.navigate(['/participants']);
						} else {
							const _successMessage = this.translate.instant('USERS.ADD.ADDUSERSUCCESSMSG');
							this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
							this.router.navigate(['/users']);
						}
					},
					error => {
						this.submitted = false;
						this.showError = true;
						this.errors = error.error[0];

					});
			}
		} else {
			this.submitted = false;
		}
	}

	getAdditionalUserFieldsVariable() {
		this.additionalUserFieldsObs = this._environmentVariableService.getAdditionalUserFieldsVariable();
	}

	getRoles() {
		this.rolesObs = this._crudService.getList<Role>('admin/access-roles');
	}

	getLanguages() {
		this.languageObs = this._crudService.getList<Language>('admin/languages');
	}

	getUserTitles() {
		this.userTitleObs = this._crudService.getList<UserTitle>('admin/user-titles');
	}

	getJobTitles() {
		this.jobTitleObs = this._crudService.getList<JobTitle>('admin/job-titles');
	}

	getNicknames() {
		this.nicknamesObs = this._crudService.getList<Nickname>('admin/nicknames');
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (!this.isArabic) {
			this.bindLabel = 'role_name';
			this.bindLabelLang = 'language_name_en';
			this.bindLabelUserTitle = 'user_title_name_en';
			this.bindLabelJobTitle = 'job_title_name_en';
			this.bindLabelNickname = 'nickname_en';
		}
	}

	openAddUserByNationalIdDialog() {
		const ref = this.dialog.open(AddUserByNationalIdDialogComponent, {
			width: '440px'
		});

		ref.beforeClosed().subscribe(nationalId => {
			console.log('beforeClosed - nationalId', nationalId);
			if (nationalId) {
				console.log('user_before', this.user);

				this._crudService.fetchByNationalId<any>(nationalId).subscribe(
					(response_) => {
						this.isSubmittedByFetcher = true;
						console.log('fetchByNationalId - response_', response_);
						const response = response_;
						this.user.name_ar = response.fullName;
						this.user.name = response.fullName;

						this.user.user_phone = response.phoneNumber;

						this.user.job_id = response.socialSecurityNumber;
						this.user.job_title = response.jobTitle;
						this.user.responsible_administration = response.departmentName;


						this.user.hr_categoryName = response.hR_CategoryName; // --
						this.user.hr_gradeName = response.hR_GradeName; // --
						this.user.areaName = response.areaName; // --

						console.log('fetchByNationalId - user', this.user);

					});


				// this.user.national_id = result;
			}
		});
	}

	RemoveAutoFill() {
		this.isSubmittedByFetcher = false;
	}
}
