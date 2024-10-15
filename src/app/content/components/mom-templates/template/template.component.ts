import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { MomTemplate } from '../../../../core/models/mom-template';
import { environment } from '../../../../../environments/environment';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { Image } from '../../../../core/models/image';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-template',
  templateUrl: './template.component.html',

})
export class TemplateComponent implements OnInit {

  momTemplate = new MomTemplate();
  submitted: boolean = false;
  momTemplateId: number;
  edit: boolean = false;
  isCollapsed1 = false;
  isCollapsed2 = false;
  logoImageChangedEvent: any;
  image_url: string;
  logoImageUrlObs: Observable<any>;
  logoImageSizeError: string = '';
  fileTypeError: boolean = false;
  fileExtensions: Array<String> = ['jpeg', 'jpg', 'png'];
	isArabic: boolean;

  constructor(private _crudService: CrudService, private route: ActivatedRoute,
    private router: Router,
    private _translationService: TranslationService,
    private _uploadService: UploadService,
    private translate: TranslateService) {
    this.momTemplate.show_agenda_list = false;
    this.momTemplate.show_conclusion = false;
    this.momTemplate.show_mom_header = false;
    this.momTemplate.show_participant_job = false;
    this.momTemplate.show_participant_nickname = false;
    this.momTemplate.show_participant_title = false;
    this.momTemplate.show_presenters = false;
    this.momTemplate.show_recommendation = false;
    this.momTemplate.show_purpose = false;
    this.momTemplate.show_timer = false;
    this.momTemplate.show_vote_results = false;
    this.momTemplate.show_vote_status = false;
  }

  ngOnInit() {
    this.getLanguage();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.momTemplateId = +params['id']; // (+) converts string 'id' to a number
        this._crudService.get<MomTemplate>('admin/mom-templates', this.momTemplateId).subscribe(
          res => {
            this.momTemplate = res;
            if (this.momTemplate.logo_image && this.momTemplate.logo_image.image_url) {
              this.image_url = environment.imagesBaseURL + this.momTemplate.logo_image.image_url;
            }
          },
          error => {
            // console.log('error');
          });
      }
    },
      error => {
        // console.log('error');
      });
  }

  hasError(momTemplateForm: NgForm, field: string, validation: string) {
    if (momTemplateForm && Object.keys(momTemplateForm.form.controls).length > 0 && momTemplateForm.form.controls[field] &&
      momTemplateForm.form.controls[field].errors && validation in momTemplateForm.form.controls[field].errors) {
      if (validation) {
        return (momTemplateForm.form.controls[field].dirty &&
          momTemplateForm.form.controls[field].errors[validation]) || (this.edit && momTemplateForm.form.controls[field].errors[validation]);
      }
      return (momTemplateForm.form.controls[field].dirty &&
        momTemplateForm.form.controls[field].invalid) || (this.edit && momTemplateForm.form.controls[field].invalid);
    }
  }

  save(momTemplateForm: NgForm) {
    this.submitted = true;
    this.edit = true;

    if (momTemplateForm.valid && this.fileTypeError === false) { // submit form if valid
      if (this.momTemplateId) { // if edit
        if (this.logoImageChangedEvent) {
          this.imageUploader(this.logoImageChangedEvent);
          forkJoin([this.logoImageUrlObs]).subscribe(data => {
            if (!this.momTemplate.logo_image) {
              this.momTemplate.logo_image = new Image();
            }
            this.momTemplate.logo_image.original_image_url = data[0].url;
            this.momTemplate.logo_image.image_url = data[0].url;
            this.updateMomTemplate();
          }, erroe => {
            this.logoImageSizeError = this.translate.instant('MOM_TEMPLATE_PAGE.IMAGE_SIZE_ERROR');
            this.submitted = false;
            this.scrollUp();
          });
        } else {
         this.updateMomTemplate();
        }
      } else { // if add
        if (this.logoImageChangedEvent) {
          this.imageUploader(this.logoImageChangedEvent);
          forkJoin([this.logoImageUrlObs]).subscribe(data => {
            if (!this.momTemplate.logo_image) {
              this.momTemplate.logo_image = new Image();
            }
            this.momTemplate.logo_image.original_image_url = data[0].url;
            this.momTemplate.logo_image.image_url = data[0].url;
            this.addMomTemplate();
          }, erroe => {
            this.logoImageSizeError = this.translate.instant('MOM_TEMPLATE_PAGE.IMAGE_SIZE_ERROR');
            this.submitted = false;
            this.scrollUp();
          });
        } else {
         this.addMomTemplate();
        }
      }
    } else {
      this.submitted = false;
    }
  }

  addMomTemplate() {
    this._crudService.add<MomTemplate>('admin/mom-templates', this.momTemplate).subscribe(
      data => {
        this.router.navigate(['/mom-templates']);
      },
      error => {
        this.submitted = false;
      });
  }

  updateMomTemplate() {
    this._crudService.edit<MomTemplate>('admin/mom-templates', this.momTemplate, this.momTemplateId).subscribe(
      data => {
        this.router.navigate(['/mom-templates']);
      },
      error => {
        this.submitted = false;
      });
  }

  redirect() {
    this.router.navigate(['/mom-templates']);
  }

  detectFiles(event) {
    this.logoImageSizeError = '';
    this.fileTypeError = false;
    const extension = event.target.files[0].name.split('.');
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
        this.image_url = environment.imagesBaseURL + this.momTemplate.logo_image.image_url;
        this.fileTypeError = true;
    }
  }

  imageUploader(image: File) {
    if (image) {
        this.logoImageUrlObs = this._uploadService.uploadMomTemplateLogo<File>(image);
    }
  }

  scrollUp() {
    window.scroll({
			top: 0,
			behavior: 'smooth'
		});
  }

  getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}
}
