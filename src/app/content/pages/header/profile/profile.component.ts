import { HeaderService } from './../../../../core/services/layout/header.service';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Models
import { User } from '../../../../core/models/user';
import { Image } from '../../../../core/models/image';

// Services
import { UserService } from '../../../../core/services/security/users.service';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { ActivatedRoute } from '@angular/router';
import { Language } from '../../../../core/models/language';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { UserTitle } from '../../../../core/models/user-title';
import { JobTitle } from '../../../../core/models/job-title';
import { Nickname } from '../../../../core/models/nickname';
import { Roles } from '../../../../core/models/enums/roles';
import { attachment } from '../../../../core/config/attachment';
import { Attachment } from '../../../../core/models/attachment';
import { OrganizationService } from '../../../../core/services/organization/organization.service';

@Component({
    selector: 'm-profile',
    templateUrl: './profile.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class ProfileComponent implements OnInit {

    user = new User();
    submitted: boolean = false;
    edit: boolean = false;
    image_url: string;
    imagesBaseURL: string = environment.imagesBaseURL;
    logoImageChangedEvent: any;
    logoImageUrlObs: Observable<any>;
    disclosureUrlObs: Observable<any>;
    observableArray: Array<Observable<any>> = [];
    message: string = '';
    type: string = '';
    logoImageSizeError: string = '';
    fileTypeError: boolean = false;
    fileExtensions: Array<String> = ['jpeg', 'jpg', 'png'];
    accessRights: any;
    isArabic: boolean;
    bindLabel: string = 'right_name_ar';
    bindLabelLang: string = 'language_name_ar';
    showError: boolean = false;
    errors: Array<String>;
    accessRightsObs: Observable<any[]>;
    languageObs: Observable<Language[]>;
    languages: Array<Language> = [];

    userTitleObs: Observable<UserTitle[]>;
    jobTitleObs: Observable<JobTitle[]>;
    nicknamesObs: Observable<Nickname[]>;
    userTitles: Array<UserTitle> = [];
    jobTitles: Array<JobTitle> = [];
    nicknames: Array<Nickname> = [];
    bindLabelUserTitle = 'user_title_name_ar';
    bindLabelJobTitle = 'job_title_name_ar';
    bindLabelNickname = 'nickname_ar';
    roles = Roles;
    attachmentUrl: string;
    attachmentTypeError: boolean = false;
    attachmentExtensions: Array<String> = ['pdf'];
    attachmentSizeError: string = '';
    attachmentChangedEvent: any;
    isSytemUser: boolean = false;

    constructor(private _userService: UserService,
        private _uploadService: UploadService,
        private translate: TranslateService,
        private headerService: HeaderService,
        private _roleService: RoleService,
        private _translationService: TranslationService,
        private layoutUtilsService: LayoutUtilsService,
        private route: ActivatedRoute,
        private _crudService: CrudService,
        private _organizationService: OrganizationService) {

    }


    ngOnInit() {
        this.getLanguage();
        this.getLanguages();
        this.getJobTitles();
        this.getUserTitles();
        this.getNicknames();
        this.getAccessRights();
        this.route.params.subscribe(params => {
            forkJoin([this.accessRightsObs, this.languageObs, this.userTitleObs, this.jobTitleObs, this.nicknamesObs])
                .subscribe(data => {
                    this.accessRights = data[0];
                    this.languages = data[1];
                    this.userTitles = data[2];
                    this.jobTitles = data[3];
                    this.nicknames = data[4];
                    this.getCurrentUser();
                },
                    error => {
                        // console.log('error');
                    });
        });
    }

    save(profileForm: NgForm) {
        this.submitted = true;
        this.edit = true;
        this.message = '';
        this.type = '';
        this.validateFile();
        if (profileForm.valid && this.fileTypeError === false && !this.attachmentTypeError && this.attachmentSizeError.length == 0) { // submit form if valid
            if (this.user.password === this.user.rpassword) {
                if (this.logoImageChangedEvent || this.attachmentChangedEvent) {
                    this.imageUploader(this.logoImageChangedEvent);
                    this.uploadDisclosure(this.attachmentChangedEvent);
                    forkJoin(this.observableArray).subscribe(d => {
                        this.observableArray = [];
                        if(this.logoImageChangedEvent){
                            this.user.profile_image = new Image();
                            this.user.profile_image.original_image_url = d[0].url;
                            this.user.profile_image.image_url = d[0].url;
                            if(this.attachmentChangedEvent){
                                this.user.disclosure_url = d[1].url;
                            }
                        } else {
                            this.user.disclosure_url = d[0].url;
                        }
                        // tslint:disable-next-line:no-debugger
                        this.updateData();
                    }, error => {
                        this.logoImageSizeError = this.translate.instant('PROFILE.IMAGE_SIZE_ERROR');
                        this.submitted = false;
                    });
                } else if(!this.logoImageChangedEvent && !this.attachmentChangedEvent){
                    this.updateData();
                }
            } else {
                this.submitted = false;
            }
        } else {
            this.submitted = false;
        }
    }

    hasError(profileForm: NgForm, field: string, validation: string) {
        if (profileForm && Object.keys(profileForm.form.controls).length > 0 && profileForm.form.controls[field] &&
            profileForm.form.controls[field].errors && validation in profileForm.form.controls[field].errors) {
            if (validation) {
                return (profileForm.form.controls[field].dirty &&
                    // tslint:disable-next-line:max-line-length
                    profileForm.form.controls[field].errors[validation]) || (this.edit && profileForm.form.controls[field].errors[validation]);
            }
            return (profileForm.form.controls[field].dirty &&
                profileForm.form.controls[field].invalid) || (this.edit && profileForm.form.controls[field].invalid);
        }
    }

    getCurrentUser() {
        this._userService.getCurrentUser().subscribe(res => {
            this.user = res.user;
            this.isSytemUser = this.user.organization? false : true;
            if (this.user.image_url) {
                this.image_url = this.imagesBaseURL + this.user.image_url;
            }
            if(this.user.disclosure_url) {
                this.attachmentUrl = this.translate.instant('PROFILE.DISCLOSURE_FILE_NAME') + (this.user.disclosure_url? '.' + this.user.disclosure_url.split('.').pop() : '.doc');
            }
        }, error => {

        });
    }

    getAccessRights() {
        this.accessRightsObs = this._roleService.getAccessRights();
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
            this.image_url = this.imagesBaseURL + this.user.image_url;
            this.fileTypeError = true;
        }
    }

    imageUploader(image: File) {
        if (image) {
            this.logoImageUrlObs = this._uploadService.uploadUserImage<File>(image);
            this.observableArray.push(this.logoImageUrlObs);
        }
    }

    uploadDisclosure (file: File) {
        if (file) {
            this.disclosureUrlObs = this._uploadService.uploadDisclosure<File>(file);
            this.observableArray.push(this.disclosureUrlObs);
        }
    }

    updateData() {
        this._userService.updateMyProfile<any>(this.user).subscribe(
            data => {
                this.type = 'success';
                this.message = data.message;
                this.submitted = false;
                if (this.user.profile_image) {
                    this.headerService.setImageURL(this.user.profile_image.image_url);
                }
                this.headerService.setNameEn(this.user.name);
                this.headerService.setNameAr(this.user.name_ar);
                const _message = this.translate.instant('PROFILE.SUCCESSMSG');

                this.layoutUtilsService.showActionNotification(_message, MessageType.Create);

            },
            error => {
                this.type = 'error';
                this.message = error.error;
                this.submitted = false;
                this.showError = true;
                if (this.isArabic === true) {
                    this.errors = error.error_ar;
                } else {
                    this.errors = error.error;
                }

            });
    }

    getLanguage() {
        this.isArabic = this._translationService.isArabic();
        if (!this.isArabic) {
            this.bindLabel = 'right_name';
            this.bindLabelLang = 'language_name_en';
        }
    }

    downloadFile() {
        this._userService.downloadDisclosure().subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = this.translate.instant('PROFILE.DISCLOSURE_FILE_NAME') + (this.user.disclosure_url? '.' + this.user.disclosure_url.split('.').pop() : '.doc');
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

    downloadOriginalFile() {
        if (this.isSytemUser) {
            this._organizationService.downloadSystemDisclosure().subscribe((response) => {
                const downloadURL = window.URL.createObjectURL(response);
                const link = document.createElement('a');
                link.href = downloadURL;
                link.download = this.translate.instant('PROFILE.DISCLOSURE_FILE_NAME') + '.doc';
                link.click();
            });
        } else {
            this._userService.downloadOrganizationOrDefaultDisclosure().subscribe((response) => {
                const downloadURL = window.URL.createObjectURL(response);
                const link = document.createElement('a');
                link.href = downloadURL;
                link.download = this.translate.instant('PROFILE.DISCLOSURE_FILE_NAME') + (this.user.organization.disclosure_url? '.' + this.user.organization.disclosure_url.split('.').pop() : '.doc');
                link.click();
            });
        }
    }
}
