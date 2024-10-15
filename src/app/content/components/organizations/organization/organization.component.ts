

import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Organization } from '../../../../core/models/organization';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Role } from './../../../../core/models/role';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';


// Service
import { UploadService } from '../../../../core/services/shared/upload.service';
import { UserService } from './../../../../core/services/security/users.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TimeZone } from '../../../../core/models/time-zone';
import { OrganizationType } from '../../../../core/models/organization-type';

import { OrganizationTypes } from '../../../../core/models/enums/organization-types';
import { Image } from '../../../../core/models/image';

@Component({
	selector: 'm-organization',
	templateUrl: './organization.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class OrganizationComponent implements OnInit {
	storageQuota = environment.storageQuota;

	organization = new Organization();
	submitted: boolean = false;
	organizationId: number;
	edit: boolean = false;
	errors: Array<String>;
	error: Array<any>;
	logoImageChangedEvent: any;
	image_url: string;
	logoImageUrlObs: Observable<any>;
	logoImageSizeError: string = '';
	fileTypeError: boolean = false;
	fileExtensions: Array<String> = ['jpeg', 'jpg', 'png'];
	isArabic: boolean;
	expiryDateFrom: { day: number; month: number; year: number; };
	expiryDateTo: Date;
	timeZones: TimeZone[];
	organizationTypes: OrganizationType[];
	organizationTypesEnum = OrganizationTypes;
	apiUrl: string;
	frontUrl: string;
	redisUrl: string;
	maxLicenseDurationNum: number;

	constructor(private _crudService: CrudService, private route: ActivatedRoute,
		private router: Router, private _uploadService: UploadService,
		private translate: TranslateService,
		private _translationService: TranslationService,
		private userService: UserService) {
	}

	ngOnInit() {
		this.getLanguage();
		this.getSystemTimeZones();
		this.getOrganizationTypes();
		this.getURL();
		this.maxLicenseDurationNum = (9999 - new Date().getFullYear() - 1) * 365;
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.organizationId = +params['id']; // (+) converts string 'id' to a number
				this._crudService.get<Organization>('system-admin/organizations', this.organizationId).subscribe(
					res => {
						this.organization = res;

						let date;
						if (this.organization.expiry_date_from) {
							date = new Date(this.organization.expiry_date_from);
						} else {
							date = new Date();
						}

						this.expiryDateFrom = { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
						this.setDateModel();
						this.image_url = environment.imagesBaseURL + this.organization.logo_image.image_url;
					},
					error => {
						console.log('error');
					});
			}
		});

	}

	redirect() {
		this.router.navigate(['/organizations/requests']);
	}

	hasError(organizationForm: NgForm, field: string, validation: string) {
		if (organizationForm && Object.keys(organizationForm.form.controls).length > 0 &&
			organizationForm.form.controls[field].errors && validation in organizationForm.form.controls[field].errors) {
			if (validation) {
				return (organizationForm.form.controls[field].dirty &&
					organizationForm.form.controls[field].errors[validation]) || (this.edit && organizationForm.form.controls[field].errors[validation]);
			}
			return (organizationForm.form.controls[field].dirty &&
				organizationForm.form.controls[field].invalid) || (this.edit && organizationForm.form.controls[field].invalid);
		}
	}

	detectFiles(event) {
		this.logoImageSizeError = '';
		const extension = event.target.files[0].name.split('.');
		if (this.fileExtensions.includes(extension[extension.length - 1].toLowerCase())) {
			this.logoImageChangedEvent = event.target.files[0];
			if (event.target.files[0]) {
				const reader = new FileReader();
				reader.onload = (e: any) => {
					this.image_url = e.target.result;
				};
				reader.readAsDataURL(event.target.files[0]);
			}
			this.fileTypeError = false;
		} else {
			this.image_url = environment.imagesBaseURL + this.organization.logo_image.image_url;
			this.fileTypeError = true;
		}
	}

	save(organizationForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		this.error = [];
		if (organizationForm.valid && this.fileTypeError === false) { // submit form if valid
			if (this.organizationId) { // if edit
				if (this.logoImageChangedEvent) {
					this.imageUploader(this.logoImageChangedEvent);
					forkJoin([this.logoImageUrlObs]).subscribe(data => {
						if (!this.organization.logo_image) {
							this.organization.logo_image = new Image();
						}
						this.organization.logo_image.original_image_url = data[0].url;
						this.organization.logo_image.image_url = data[0].url;
						this.updateOrganization();
					}, error => {
						this.logoImageSizeError = this.translate.instant('AUTH.VALIDATION.IMAGE_SIZE_ERROR');
						this.submitted = false;
					});
				} else {
					this.updateOrganization();
				}
			} else { // if add

				this._crudService.add<Organization>('admin/organizations', this.organization).subscribe(
					data => {
						this.router.navigate(['/organizations/requests']);
					},
					error => {
						this.submitted = false;
						if (error.error_code === 3) {
							this.errors = error.message;
						}
					});
			}
		} else {
			this.submitted = false;
		}
	}

	imageUploader(image: File) {
		if (image) {
			this.logoImageUrlObs = this._uploadService.uploadOrganizationLogo<File>(image);
		}
	}

	updateOrganization() {
		this._crudService.edit<Organization>('system-admin/organizations', this.organization, this.organizationId).subscribe(
			data => {
				this.router.navigate(['/organizations/requests']);
			},
			error => {
				this.submitted = false;
				this.error = error.error;
				if (error.error_code === 3) {
					this.errors = error.message;
				}
			});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	setDateModel() {
		if (this.expiryDateFrom != null) {
			if (this.expiryDateFrom.year != null) {
				this.organization.expiry_date_from =
					this.expiryDateFrom.year + '-' + this.expiryDateFrom.month + '-' + this.expiryDateFrom.day;
				const expiryDateFrom = new Date(this.organization.expiry_date_from);
				this.expiryDateTo = new Date(expiryDateFrom.setDate(expiryDateFrom.getDate() + this.organization.licenseDuration));
				// tslint:disable-next-line:max-line-length
				this.organization.expiry_date_to = this.expiryDateTo.getFullYear() + '-' + (this.expiryDateTo.getMonth() + 1) + '-' + this.expiryDateTo.getDate();
			}
		}
	}

	getSystemTimeZones() {
		this._crudService.getList<TimeZone>('time-zones/system-time-zones').subscribe(res => {
			this.timeZones = res;
		});
	}

	getOrganizationTypes() {
		this._crudService.getList<OrganizationType>('admin/organization-types').subscribe(res => {
			this.organizationTypes = res;
		});
	}
	getURL() {
		this.userService.getCloudURL().subscribe(res => {
			this.apiUrl = res.apiUrl;
			this.frontUrl = res.frontUrl;
			this.redisUrl = res.redisUrl;
		});
	}

	setUrl() {
		if (this.organization.organization_type_id === this.organizationTypesEnum.CLOUD) {
			this.organization.api_url = this.apiUrl;
			this.organization.front_url = this.frontUrl;
			this.organization.redis_url = this.redisUrl;
		}
	}


}
