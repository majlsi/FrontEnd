import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { Faq } from '../../../../core/models/faq';
import { FaqService } from '../../../../core/services/faq/faq.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { FaqSection } from '../../../../core/models/faq-section';

@Component({
	selector: 'm-admin-faq',
	templateUrl: './admin-faq.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class AdminFaqComponent implements OnInit {

	faq = new Faq();
	submitted: boolean = false;
	faqId: number;
	edit: boolean = false;
	faqSections: Array<FaqSection> = [];
	faqSectionObs: Observable<FaqSection[]>;
	isArabic: boolean;

	constructor(private _crudService: CrudService, private route: ActivatedRoute,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private _faqService: FaqService,
		private translate: TranslateService) {
		this.faq.is_active = false;

	}

	ngOnInit() {
		this.getLanguage();
		this.getFaqParents();
		this.route.params.subscribe(params => {
			forkJoin([this.faqSectionObs])
				.subscribe(data => {
					this.faqSections = data[0];
					if (params['id']) {
						this.faqId = +params['id'];
						this._crudService.get<Faq>('admin/faqs', this.faqId).subscribe(
							res => {
								this.faq = res;
							},
							error => {
								// console.log('error');
							});
					}
				},
					error => {
					});
		});

	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	hasError(faqForm: NgForm, field: string, validation: string) {
		if (faqForm && Object.keys(faqForm.form.controls).length > 0 && faqForm.form.controls[field] &&
			faqForm.form.controls[field].errors && validation in faqForm.form.controls[field].errors) {
			if (validation) {
				return (faqForm.form.controls[field].dirty &&
					faqForm.form.controls[field].errors[validation]) || (this.edit && faqForm.form.controls[field].errors[validation]);
			}
			return (faqForm.form.controls[field].dirty &&
				faqForm.form.controls[field].invalid) || (this.edit && faqForm.form.controls[field].invalid);
		}
	}

	save(faqForm: NgForm) {
		this.submitted = true;
		this.edit = true;

		if (faqForm.valid) { // submit form if valid
			if (this.faqId) { // if edit
				this._crudService.edit<Faq>('admin/faqs', this.faq, this.faqId).subscribe(
					data => {
						this.router.navigate(['/faqs']);
					},
					error => {
						this.layoutUtilsService.showActionNotification(this.isArabic ? error.error[0][0].error_ar : error.error[0][0].error, MessageType.Delete);
						this.submitted = false;
					});
			} else { // if add
				this._crudService.add<Faq>('admin/faqs', this.faq).subscribe(
					data => {
						this.router.navigate(['/faqs']);
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
		this.router.navigate(['/faqs']);
	}

	getFaqParents() {
		this.faqSectionObs = this._faqService.getLeafSections();
	}

}
