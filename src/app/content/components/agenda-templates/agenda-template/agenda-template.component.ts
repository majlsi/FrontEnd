import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { AgendaTemplate } from '../../../../core/models/agenda-template';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-agenda-template',
  templateUrl: './agenda-template.component.html',

})
export class AgendaTemplateComponent implements OnInit {

  agendaTemplate = new AgendaTemplate();
  submitted: boolean = false;
  agendaTemplateId: number;
  edit: boolean = false;
  isArabic: boolean = false;

  constructor(private _crudService: CrudService, private route: ActivatedRoute,
    private router: Router,
    private translationService: TranslationService,
    private translate: TranslateService) {

  }

  ngOnInit() {
    this.getLanguage();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.agendaTemplateId = +params['id']; // (+) converts string 'id' to a number
        this._crudService.get<AgendaTemplate>('admin/agenda-templates', this.agendaTemplateId).subscribe(
          res => {
            this.agendaTemplate = res;
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

  getLanguage() {
		this.isArabic = this.translationService.isArabic();
  }
  
  hasError(agendaTemplateForm: NgForm, field: string, validation: string) {
    if (agendaTemplateForm && Object.keys(agendaTemplateForm.form.controls).length > 0 && agendaTemplateForm.form.controls[field] &&
      agendaTemplateForm.form.controls[field].errors && validation in agendaTemplateForm.form.controls[field].errors) {
      if (validation) {
        return (agendaTemplateForm.form.controls[field].dirty &&
          agendaTemplateForm.form.controls[field].errors[validation]) || (this.edit && agendaTemplateForm.form.controls[field].errors[validation]);
      }
      return (agendaTemplateForm.form.controls[field].dirty &&
        agendaTemplateForm.form.controls[field].invalid) || (this.edit && agendaTemplateForm.form.controls[field].invalid);
    }
  }

  save(agendaTemplateForm: NgForm) {
    this.submitted = true;
    this.edit = true;

    if (agendaTemplateForm.valid) { // submit form if valid
      if (this.agendaTemplateId) { // if edit
        this._crudService.edit<AgendaTemplate>('admin/agenda-templates', this.agendaTemplate, this.agendaTemplateId).subscribe(
          data => {
            this.router.navigate(['/agenda-templates']);
          },
          error => {
            this.submitted = false;
          });
      } else { // if add
        this._crudService.add<AgendaTemplate>('admin/agenda-templates', this.agendaTemplate).subscribe(
          data => {
            this.router.navigate(['/agenda-templates']);
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
    this.router.navigate(['/agenda-templates']);
  }

}
