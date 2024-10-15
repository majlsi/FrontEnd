import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { FaqSection } from '../../../../core/models/faq-section';
import { FaqService } from '../../../../core/services/faq/faq.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';

@Component({
	selector: 'm-faq-section',
	templateUrl: './faq-section.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class FaqSectionComponent implements OnInit {

	faqSection = new FaqSection();
	submitted: boolean = false;
	faqSectionId: number;
	edit: boolean = false;
	faqParentSections: Array<FaqSection> = [];
	faqSectionsObs:Observable<FaqSection[]>;
	isArabic: boolean;

	constructor(private _crudService: CrudService, private route: ActivatedRoute,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private _faqService: FaqService,
		private translate: TranslateService) {

	}

	ngOnInit() {
		this.getLanguage();
		this.getFaqParentSections();
		this.route.params.subscribe(params => {
			forkJoin([this.faqSectionsObs])
				.subscribe(data => {
					this.faqParentSections = data[0];
					if (params['id']) {
						this.faqSectionId = +params['id'];
						this._crudService.get<FaqSection>('admin/faq-sections', this.faqSectionId).subscribe(
							res => {
								this.faqSection = res;
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

	hasError(faqSectionForm: NgForm, field: string, validation: string) {
		if (faqSectionForm && Object.keys(faqSectionForm.form.controls).length > 0 && faqSectionForm.form.controls[field] &&
			faqSectionForm.form.controls[field].errors && validation in faqSectionForm.form.controls[field].errors) {
			if (validation) {
				return (faqSectionForm.form.controls[field].dirty &&
					faqSectionForm.form.controls[field].errors[validation]) || (this.edit && faqSectionForm.form.controls[field].errors[validation]);
			}
			return (faqSectionForm.form.controls[field].dirty &&
				faqSectionForm.form.controls[field].invalid) || (this.edit && faqSectionForm.form.controls[field].invalid);
		}
	}

	save(faqSectionForm: NgForm) {
		this.submitted = true;
		this.edit = true;

		if (faqSectionForm.valid) { // submit form if valid
			if (this.faqSectionId) { // if edit
				this._crudService.edit<FaqSection>('admin/faq-sections', this.faqSection, this.faqSectionId).subscribe(
					data => {
						this.router.navigate(['/faq-sections']);
					},
					error => {
						this.layoutUtilsService.showActionNotification(this.isArabic? error.error[0][0].error_ar : error.error[0][0].error, MessageType.Delete);
						this.submitted = false;
					});
			} else { // if add
				this._crudService.add<FaqSection>('admin/faq-sections', this.faqSection).subscribe(
					data => {
						this.router.navigate(['/faq-sections']);
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
		this.router.navigate(['/faq-sections']);
	}

	getFaqParentSections() {
		this.faqSectionsObs = this._faqService.getFaqParentSections();
	}

}
