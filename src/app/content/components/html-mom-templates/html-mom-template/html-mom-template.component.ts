import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { HtmlMomTemplate } from '../../../../core/models/html-mom-template';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-html-mom-template',
  templateUrl: './html-mom-template.component.html',

})
export class HtmlMomTemplateComponent implements OnInit {

  htmlMomTemplate = new HtmlMomTemplate();
  submitted: boolean = false;
  htmlMomTemplateId: number;
  edit: boolean = false;
  isArabic: boolean = false;

  constructor(private _crudService: CrudService, private route: ActivatedRoute,
    private router: Router,
    private _translationService: TranslationService,
    private translate: TranslateService) {

  }

  ngOnInit() {
    this.getLanguage();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.htmlMomTemplateId = +params['id']; // (+) converts string 'id' to a number
        this._crudService.get<HtmlMomTemplate>('admin/html-mom-templates', this.htmlMomTemplateId).subscribe(
          res => {
            this.htmlMomTemplate = res;
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

  hasError(htmlMomTemplateForm: NgForm, field: string, validation: string) {
    if (htmlMomTemplateForm && Object.keys(htmlMomTemplateForm.form.controls).length > 0 && htmlMomTemplateForm.form.controls[field] &&
      htmlMomTemplateForm.form.controls[field].errors && validation in htmlMomTemplateForm.form.controls[field].errors) {
      if (validation) {
        return (htmlMomTemplateForm.form.controls[field].dirty &&
          htmlMomTemplateForm.form.controls[field].errors[validation]) || (this.edit && htmlMomTemplateForm.form.controls[field].errors[validation]);
      }
      return (htmlMomTemplateForm.form.controls[field].dirty &&
        htmlMomTemplateForm.form.controls[field].invalid) || (this.edit && htmlMomTemplateForm.form.controls[field].invalid);
    }
  }

  save(htmlMomTemplateForm: NgForm) {
    this.submitted = true;
    this.edit = true;

    if (htmlMomTemplateForm.valid) { // submit form if valid
      if (this.htmlMomTemplateId) { // if edit
        this._crudService.edit<HtmlMomTemplate>('admin/html-mom-templates', this.htmlMomTemplate, this.htmlMomTemplateId).subscribe(
          data => {
            this.router.navigate(['/mom-summary-templates']);
          },
          error => {
            this.submitted = false;
          });
      } else { // if add
        this._crudService.add<HtmlMomTemplate>('admin/html-mom-templates', this.htmlMomTemplate).subscribe(
          data => {
            this.router.navigate(['/mom-summary-templates']);
          },
          error => {
            this.submitted = false;
          });
      }
    } else {
      this.submitted = false;
    }
  }

  redirect() {
    this.router.navigate(['/mom-summary-templates']);
  }

  getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}
}
