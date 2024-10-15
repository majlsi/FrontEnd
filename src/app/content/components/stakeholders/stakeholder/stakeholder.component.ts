
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Stakeholder } from '../../../../core/models/stakeholder';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Role } from '../../../../core/models/role';
import { Language } from '../../../../core/models/language';
import { forkJoin, Observable } from 'rxjs';
import { TranslationService } from '../../../../core/services/translation.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { StakeholderService } from '../../../../core/services/stakeholder/stakeholder.service';
@Component({
	selector: 'm-stakeholder',
	templateUrl: './stakeholder.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class StakeholderComponent implements OnInit {
	dateOfBirth: any;
	stakeholder = new Stakeholder();
	submitted: boolean = false;
	userId: number;
	edit: boolean = false;
	showError: boolean = false;
	rolesObs: Observable<Role[]>;
	languageObs: Observable<Language[]>;
	errors: Array<any>;
	roles: Array<Role> = [];
	languages: Array<Language> = [];
	isArabic: boolean;
	bindLabel: string = 'role_name_ar';
	bindLabelLang: string = 'language_name_ar';
	totalShares: number = 0;
	initialShare: number = 0;
	today = new Date();
	maxDate = {
		year: this.today.getFullYear(),
		month: this.today.getMonth() + 1,
		day: this.today.getDate()
	};
	minDate = {
		year: this.today.getFullYear() - 100,
		month: this.today.getMonth() + 1,
		day: this.today.getDate()
	};
	@Input() isParticipant: boolean;
	shareValid: boolean = true;

	constructor(private _crudService: CrudService, private route: ActivatedRoute, private router: Router,
		private _translationService: TranslationService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private _stakeholderService: StakeholderService) {

	}

	ngOnInit() {
		this.getLanguage();
		this.getRoles();
		this.getLanguages();
		this.route.params.subscribe(params => {
			forkJoin([this.rolesObs, this.languageObs])
				.subscribe(data => {
					this.roles = data[0];
					this.languages = data[1];
					if (!this.isParticipant) {
						this.roles = this.roles.filter(function (item) {
							return item.can_assign === 1;
						});
					} else {
						const participantRole = this.roles.filter(function (item) {
							return item.can_assign === 0;
						});
						this.stakeholder.role_id = participantRole[0].id;
					}
					this._stakeholderService.getTotalShares().subscribe(res => {
						this.totalShares = parseFloat(res.total_shares === null ? 0 : res.total_shares);
					});
					if (params['id']) {
						this.userId = +params['id']; // (+) converts string 'id' to a number
						this._crudService.get<Stakeholder>('stakeholders', this.userId).subscribe(
							res => {
								this.stakeholder = res;
								this.dateOfBirth = {
									year: parseInt(this.stakeholder.date_of_birth.split('-')[0]),
									month: parseInt(this.stakeholder.date_of_birth.split('-')[1]),
									day: parseInt(this.stakeholder.date_of_birth.split('-')[2])
								};
								this.initialShare = this.stakeholder.share;
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
			this.router.navigate(['/Stakeholders']);
		}
	}

	hasError(userForm: NgForm, field: string, validation: string) {
		if (userForm && Object.keys(userForm.form.controls).length > 0 &&
			userForm.form.controls[field].errors && validation in userForm.form.controls[field].errors) {
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

		if (userForm.valid && this.stakeholder.password === this.stakeholder.rpassword) { // submit form if valid
			if (this.userId) { // if edit
				this._crudService.edit<Stakeholder>('stakeholders', this.stakeholder, this.userId).subscribe(
					data => {
						if (this.isParticipant) {
							const _successMessage = this.translate.instant('USERS.ADD.EDITPARTICIPANTSUCCESSMSG');
							this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
							this.router.navigate(['/participants']);
						} else {
							const _successMessage = this.translate.instant('STAKEHOLDER.ADD.EDITSTAKEHOLDERSUCCESSMSG');
							this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Update);
							this.router.navigate(['/Stakeholders']);
						}
					},
					error => {
						this.submitted = false;
						if (typeof (error.error) == 'string') {
							this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Delete);
						} else {
							this.showError = true;
							this.errors = error.error[0];
						}
					});
			} else { // if add

				this._crudService.add<Stakeholder>('stakeholders', this.stakeholder).subscribe(
					data => {
						if (this.isParticipant) {
							const _successMessage = this.translate.instant('USERS.ADD.ADDPARTICIPANTSUCCESSMSG');
							this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
							this.router.navigate(['/participants']);
						} else {
							const _successMessage = this.translate.instant('STAKEHOLDER.ADD.ADDSTAKEHOLDERSUCCESSMSG');
							this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Create);
							this.router.navigate(['/Stakeholders']);
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

	getRoles() {
		this.rolesObs = this._crudService.getList<Role>('admin/access-roles');
	}

	getLanguages() {
		this.languageObs = this._crudService.getList<Language>('admin/languages');
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (!this.isArabic) {
			this.bindLabel = 'role_name';
			this.bindLabelLang = 'language_name_en';
		}
	}

	setDateModel() {

		if (this.dateOfBirth != null) {
			if (this.dateOfBirth.year != null) {
				this.stakeholder.date_of_birth =
					this.dateOfBirth.year + '-' + this.dateOfBirth.month + '-' + this.dateOfBirth.day;
			}

		}
	}
	updateTotalShare(e) {
		if (e.valid) {
			this.shareValid = parseFloat(e.value) >= 0.01 && parseFloat(e.value) <= 100
			this._stakeholderService.getTotalShares().subscribe(res => {
				this.totalShares = parseFloat(res.total_shares === null ? 0 : res.total_shares) - this.initialShare + parseFloat(e.value);
				this.totalShares = +parseFloat(this.totalShares.toString()).toFixed(2)
			})
		}
	}
}
