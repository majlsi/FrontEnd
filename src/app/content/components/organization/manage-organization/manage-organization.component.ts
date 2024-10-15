
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
import { TranslationService } from '../../../../core/services/translation.service';
import { TimeZone } from '../../../../core/models/time-zone';
import { UserService } from '../../../../core/services/security/users.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { MessageType, LayoutUtilsService } from '../../../../core/services/layout-utils.service';
import { Image } from '../../../../core/models/image';
import { ZoomConfiguration } from '../../../../core/models/zoom-configuration';
import { OnlineMeetingApp } from '../../../../core/models/online-meeting-app';
import { OnlineMeetingApps } from '../../../../core/models/enums/online-meeting-apps';
import { MicrosoftTeamConfiguration } from '../../../../core/models/microsoft-team-configuration';
import { attachment } from '../../../../core/config/attachment';
import { Attachment } from '../../../../core/models/attachment';

@Component({
    selector: 'm-manage-organization',
    templateUrl: './manage-organization.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class ManageOrganizationComponent implements OnInit {

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
    onlineMeetingApps: Array<OnlineMeetingApp> = [];
    onlineMeetingAppsEnum = OnlineMeetingApps;
    disclosureUrlObs: Observable<any>;
    observableArray: Array<Observable<any>> = [];
    attachmentUrl: string;
    attachmentTypeError: boolean = false;
    attachmentExtensions: Array<String> = ['doc', 'docx'];
    attachmentSizeError: string = '';
    attachmentChangedEvent: any;

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
        this.getOnlineMeetingApps();
        this.route.params.subscribe(params => {
            forkJoin([this.currentUserObs, this.timeZonesObs]).subscribe(data => {
                this.organizationId = data[0].user.organization.id;
                this.timeZones = data[1];
                this._crudService.get<Organization>('admin/organizations', this.organizationId).subscribe(
                    res => {
                        this.organization = res;
                        if (this.organization.logo_image.image_url) {
                            this.image_url = environment.imagesBaseURL + this.organization.logo_image.image_url;
                        }
                        if(this.organization.disclosure_url) {
                            this.attachmentUrl = this.translate.instant('PROFILE.DISCLOSURE_FILE_NAME') + (this.organization.disclosure_url? '.' + this.organization.disclosure_url.split('.').pop() : '.doc');
                        }
                    },
                    error => {
                        console.log('error');
                    });
            }, erroe => {

            });
        });

    }


    hasError(organizationForm: NgForm, field: string, validation: string) {
        if (organizationForm && Object.keys(organizationForm.form.controls).length > 0 &&
            organizationForm.form.controls[field] && organizationForm.form.controls[field].errors && validation in organizationForm.form.controls[field].errors) {
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
        this.validateFile();
        if (organizationForm.valid && this.fileTypeError === false && this.image_url && !this.attachmentTypeError && this.attachmentSizeError.length == 0) { // submit form if valid
            if (this.organizationId) { // if edit
                if (this.logoImageChangedEvent || this.attachmentChangedEvent) {
                    this.imageUploader(this.logoImageChangedEvent);
                    this.uploadDisclosure(this.attachmentChangedEvent);
                    forkJoin(this.observableArray).subscribe(data => {
                        this.observableArray = [];
                        if(this.logoImageChangedEvent){
                            if (!this.organization.logo_image) {
                                this.organization.logo_image = new Image();
                            }
                            this.organization.logo_image.original_image_url = data[0].url;
                            this.organization.logo_image.image_url = data[0].url;
                            if(this.attachmentChangedEvent){
                                this.organization.disclosure_url = data[1].url;
                            }
                        } else {
                            this.organization.disclosure_url = data[0].url;
                        }
                        this.updateOrganization();
                    }, erroe => {
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
            if (!this.image_url) {
                this.fileRequiredError = true;
            }
        }
    }

    imageUploader(image: File) {
        if (image) {
            this.logoImageUrlObs = this._uploadService.uploadOrganizationLogo<File>(image);
            this.observableArray.push(this.logoImageUrlObs);
        }
    }

    updateOrganization() {
        this._crudService.edit<Organization>('admin/organizations', this.organization, this.organizationId).subscribe(
            data => {
                const _message = this.translate.instant('ORGANIZATIONS.VALIDATION.SUCCESSMSG');
                this.layoutUtilsService.showActionNotification(_message, MessageType.Create);
                this.submitted = false;
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

    getOnlineMeetingApps() {
        this._crudService.getList<OnlineMeetingApp>('admin/online-meeting-apps').subscribe(res => {
            this.onlineMeetingApps = res;
        });
    }

    setAppsFlags() {
    }

    uploadDisclosure (file: File) {
        if (file) {
            this.disclosureUrlObs = this._uploadService.uploadDisclosure<File>(file);
            this.observableArray.push(this.disclosureUrlObs);
        }
    }

    downloadFile() {
        this._organizationService.downloadDisclosure().subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = this.translate.instant('PROFILE.DISCLOSURE_FILE_NAME') + (this.organization.disclosure_url? '.' + this.organization.disclosure_url.split('.').pop() : '.doc');
			link.click();
		});
    }

    fileChangeEvent(event: any): void {
		this.attachmentSizeError = '';
		this.attachmentTypeError = false;
		if(event.target.files[0]){
			const extension = event.target.files[0].name.split('.');
			this.attachmentChangedEvent = event.target.files[0];
			this.attachmentUrl = event.target.files[0].name;
			this.attachmentTypeError = (this.attachmentExtensions.includes(extension[extension.length - 1].toLowerCase()))? false : true;
		} else {
			this.attachmentUrl = null;
			this.attachmentChangedEvent = null;
		}
    }
    
    validateFile(){
        this.attachmentSizeError = '';
        const fileSize = this.attachmentChangedEvent? (this.attachmentChangedEvent.size / 1000) : 0;
	    if (fileSize > attachment.file_size){
            this.attachmentSizeError = this.translate.instant('PROFILE.VALIDATION.File_SIZE_ERROR');
        } else if (fileSize == 0 && this.attachmentChangedEvent) {
            this.attachmentSizeError = this.translate.instant('PROFILE.VALIDATION.File_ZERO_SIZE_ERROR');
        }
    }

    downloadDefaultFile() {
        this._organizationService.downloadSystemDisclosure().subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = this.translate.instant('PROFILE.DISCLOSURE_FILE_NAME') + '.doc';
			link.click();
		});
    }
}
