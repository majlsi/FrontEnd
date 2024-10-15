import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { SpinnerButtonOptions } from '../../../partials/content/general/spinner-button/button-options.interface';

// services
import { CrudService } from '../../../../core/services/shared/crud.service';
import { SettingService } from './../../../../core/services/setting/setting.service';

// models
import { Setting } from '../../../../core/models/setting';
import { Module } from '../../../../core/models/module';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { Configration } from '../../../../core/models/configration';
import { attachment } from '../../../../core/config/attachment';
import { UploadService } from '../../../../core/services/shared/upload.service';

@Component({
    selector: 'm-settings',
    templateUrl: './settings.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class SettingsComponent implements OnInit {

    configration: Configration = new Configration();
    private edit: boolean;
    spinner: SpinnerButtonOptions = { active: false, spinnerSize: 20 };
    message: string = '';
    error: string = '';
    isArabic: boolean;
    settingsFiles: Array<any> = [];
    introductionArabicPdfUrl: string;
    introductionEnglishPdfUrl: string;
    thirdPdfUrl: string;
    introductionArabicPDFChangedEvent: any ;
    introductionEnglishPDFChangedEvent: any;
    thirdPDFChangedEvent: any;

    introductionEnglishPDFSizeError: string ='';
    thirdPDFSizeError: string ='';

    introductionArabicPDFSizeError: string ='';
    hasIntroductionArabicPDFExtensionError: boolean = false;
    hasIntroductionEnglishPDFExtensionError: boolean = false;
    hasThirdPDFExtensionError: boolean = false;
	objectObserver: Observable<string>;
    observableArray: Array<Observable<any>> = [];
    keyObservableArray: Array<string> = [];
    
    constructor(private _crudService: CrudService,
        private _settingService: SettingService,
        private translationService: TranslationService,
        private translate: TranslateService,
        private layoutUtilsService: LayoutUtilsService,
        private _uploadService: UploadService) {
    }

    ngOnInit() {
        this.isArabic = this.translationService.isArabic();
        this.getSettings();
    }

    getSettings() {
        this._crudService.get<Configration>('admin/configrations',1).subscribe(res => {
            this.configration = res;
        });
    }

    hasError(form: NgForm, field: string, validation: string) {
        if (
            form &&
            Object.keys(form.form.controls).length > 0 &&
            form.form.controls[field] &&
            form.form.controls[field].errors &&
            validation in form.form.controls[field].errors
        ) {
            if (validation) {
                return (
                    (this.edit &&
                        form.form.controls[field].dirty &&
                        form.form.controls[field].errors[validation]) ||
                    (this.edit && form.form.controls[field].errors[validation])
                );
            }
            return (
                (this.edit &&
                    form.form.controls[field].dirty &&
                    form.form.controls[field].invalid) ||
                (this.edit && form.form.controls[field].invalid)
            );
        }
    }

    save(form: NgForm) {
        this.edit = true;
        this.message = '';
        this.error = '';
        if (form.valid && this.filesValidation()) {
            this.uploadFiles();
            this.spinner.active = true;
        
            if (this.observableArray.length > 0) {
				forkJoin(this.observableArray)
					.subscribe(dataObs => {
						this.bindPDFs(dataObs);
						this.updateSettings();
						this.observableArray = [];
						this.keyObservableArray = [];
					},
						error => {
							this.spinner.active = false;
							this.observableArray = [];
                            this.keyObservableArray = [];
                            this.error = error.error[0];
                            this.scrollTop();
					});
			} else {
				this.updateSettings();
			}
        }
    }

    fileChangeEvent(event: any, fileType: string): void {
		if (fileType === 'introduction_english_pdf_url') {
			this.introductionEnglishPDFChangedEvent = event;
			this.introductionEnglishPDFSizeError = '';
			if (this.hasSizeError(event.target.files[0])) {
				this.introductionEnglishPDFSizeError = this.translate.instant('SETTINGS.VALIDATION.FILE_SIZE');
			}
			this.hasIntroductionEnglishPDFExtensionError = this.hasExtensionError(event.target.files[0]);
		} else if (fileType === 'introduction_arabic_pdf_url') {
			this.introductionArabicPDFChangedEvent = event;
			this.introductionArabicPDFSizeError = '';
			if (this.hasSizeError(event.target.files[0])) {
				this.introductionArabicPDFSizeError = this.translate.instant('SETTINGS.VALIDATION.FILE_SIZE');
			}
			this.hasIntroductionArabicPDFExtensionError = this.hasExtensionError(event.target.files[0]);
		} else if (fileType === 'third_pdf_url') {
			this.thirdPDFChangedEvent = event;
			this.thirdPDFSizeError = '';
			if (this.hasSizeError(event.target.files[0])) {
				this.thirdPDFSizeError = this.translate.instant('SETTINGS.VALIDATION.FILE_SIZE');
			}
			this.hasThirdPDFExtensionError = this.hasExtensionError(event.target.files[0]);
		}
    }
    
    hasSizeError(file){
		const fileSize = file? (file.size / 1000) : 0;
		return fileSize > attachment.file_size;
    }

    hasExtensionError(file){
		if (!file) {
			return false;
		}
		const extension = file.name.split('.');
        const fileExtensions = ['pdf'];

		return !fileExtensions.includes(extension[extension.length - 1].toLowerCase());
    }
    
    filesValidation() {
        return !this.hasThirdPDFExtensionError && !this.hasIntroductionEnglishPDFExtensionError
        && !this.hasIntroductionArabicPDFExtensionError && this.introductionArabicPDFSizeError.length == 0
        && this.thirdPDFSizeError.length == 0 && this.introductionEnglishPDFSizeError.length ==0
    }

    uploadFiles() {
		if (this.introductionArabicPDFChangedEvent) {
			this.fileUploader(this.introductionArabicPDFChangedEvent.target.files[0], 'introduction_arabic_pdf_url');
		}
		if (this.introductionEnglishPDFChangedEvent) {
			this.fileUploader(this.introductionEnglishPDFChangedEvent.target.files[0], 'introduction_english_pdf_url');
		}
		if (this.thirdPDFChangedEvent) {
			this.fileUploader(this.thirdPDFChangedEvent.target.files[0], 'third_pdf_url');
		}
    }

    fileUploader(file: File, type: string) {
		if (file) {
			this.objectObserver = this._uploadService.uploadSystemPdf<File>(file);
			this.observableArray.push(this.objectObserver);
			this.keyObservableArray.push(type);
		}
    }

    updateSettings() {
        this._settingService.updateConfigrationValues(this.configration,1).subscribe(res => {
            this.layoutUtilsService.showActionNotification(this.translate.instant('SETTINGS.UPDATED_SUCCESS'));
            this.spinner.active = false;
            this.observableArray = [];
			this.keyObservableArray = [];
        }, error => {
            this.layoutUtilsService.showActionNotification(this.translate.instant('SETTINGS.UPDATED_ERROR'), MessageType.Create);
            this.spinner.active = false;
            this.observableArray = [];
		    this.keyObservableArray = [];
        });
    }

    bindPDFs(dataObs: any[]) {
		if (this.keyObservableArray.indexOf('introduction_arabic_pdf_url') >= 0) {
			this.configration.introduction_arabic_pdf_url = dataObs[this.keyObservableArray.indexOf('introduction_arabic_pdf_url')].url;
		}
		if (this.keyObservableArray.indexOf('introduction_english_pdf_url') >= 0) {
			this.configration.introduction_english_pdf_url = dataObs[this.keyObservableArray.indexOf('introduction_english_pdf_url')].url;
		}
		if (this.keyObservableArray.indexOf('third_pdf_url') >= 0) {
			this.configration.third_pdf_url = dataObs[this.keyObservableArray.indexOf('third_pdf_url')].url;
		}
    }
    
    scrollTop () {
		window.scroll({
			top: 0,
			behavior: 'smooth'
		});
	}
}
