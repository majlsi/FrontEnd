import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { Organization } from '../../../../core/models/organization';
import { Observable, forkJoin } from 'rxjs';
import { TimeZone } from '../../../../core/models/time-zone';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { UserService } from '../../../../core/services/security/users.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { environment } from '../../../../../environments/environment';
import { NgForm } from '@angular/forms';
import { Image } from '../../../../core/models/image';

@Component({
	selector: 'm-step2-organization-set-up',
	templateUrl: './step2-organization-set-up.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class Step2OrganizationSetUpComponent implements OnInit {

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
	fileRequiredError: boolean = false;
	fileExtensions: Array<String> = ['jpeg', 'jpg', 'png'];
	isArabic: boolean;
	timeZones: TimeZone[];
	currentUserObs: Observable<any>;
	timeZonesObs: Observable<any>;
	copyOrganiztion: Organization;
	@Output() goToNextStep = new EventEmitter();

	constructor(private _crudService: CrudService, private route: ActivatedRoute,
		private router: Router, private _uploadService: UploadService,
		private translate: TranslateService,
		private _translationService: TranslationService,
		private _userService: UserService,
		private _organizationService: OrganizationService,
		private layoutUtilsService: LayoutUtilsService) {

	}

	ngOnInit() {

		this.getLanguage();
		this.getSystemTimeZones();
		this.getCurrentUser();
		this.route.params.subscribe(params => {
			forkJoin([this.currentUserObs, this.timeZonesObs]).subscribe(data => {
				this.organizationId = data[0].user.organization.id;
				this.organization = data[0].user.organization;
				if (this.organization.logo_image && this.organization.logo_image.image_url) {
					this.image_url = environment.imagesBaseURL + this.organization.logo_image.image_url;
				}
				this.timeZones = data[1];
			}, erroe => {

			});
		});
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
		this.fileRequiredError = false;
		if (this.fileExtensions.includes(extension[extension.length - 1])) {
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
		if (organizationForm.valid && this.fileTypeError === false && this.image_url) { // submit form if valid
			if (this.organizationId) {
				if (this.logoImageChangedEvent) {
					this.imageUploader(this.logoImageChangedEvent);
					forkJoin([this.logoImageUrlObs]).subscribe(data => {
						if (!this.organization.logo_image) {
							this.organization.logo_image = new Image();
						}
						this.organization.logo_image.original_image_url = data[0].url;
						this.organization.logo_image.image_url = data[0].url;
						this.updateOrganization();
					}, erroe => {
						this.logoImageSizeError = this.translate.instant('AUTH.VALIDATION.IMAGE_SIZE_ERROR');
						this.submitted = false;
					});
				} else {
					this.updateOrganization();
				}
			}
		} else {
			this.submitted = false;
			if (!this.image_url) {
				this.fileRequiredError = true;
			}
		}
	}

	imageUploader(image: File) {
		if (image) {
			this.logoImageUrlObs = this._uploadService.uploadOrganizationLogo<File>(image);
		}
	}

	updateOrganization() {
		this._crudService.edit<Organization>('admin/organizations', this.organization, this.organizationId).subscribe(
			data => {
				const _message = this.translate.instant('ORGANIZATIONS.VALIDATION.SUCCESSMSG');

				this.layoutUtilsService.showActionNotification(_message, MessageType.Create);
				this.submitted = false;
				this.goToNextStep.emit(true);
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

	getSystemTimeZones() {
		this.timeZonesObs = this._crudService.getList<TimeZone>('time-zones/system-time-zones');
	}

	getCurrentUser() {
		this.currentUserObs = this._userService.getCurrentUser();
	}



}
