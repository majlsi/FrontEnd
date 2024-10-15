import {Component, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { DecisionType } from '../../../../core/models/decision-type';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgForm } from '@angular/forms';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
   selector: 'm-decision-type',
   templateUrl: './decision-type.component.html',
   changeDetection: ChangeDetectionStrategy.Default
})
export class DecisionTypeComponent implements OnInit {

    decisionType = new DecisionType();
    submitted: boolean = false;
    decisionTypeId: number;
    edit: boolean = false;
    isArabic: boolean = false;

    constructor(private _crudService: CrudService, private route: ActivatedRoute,
        private router: Router,
        private _translationService: TranslationService,
        private layoutUtilsService: LayoutUtilsService,
        private translate: TranslateService) {
    }

	ngOnInit() {
        this.getLanguage();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.decisionTypeId = +params['id']; // (+) converts string 'id' to a number
                this._crudService.get<DecisionType>('admin/decision-types', this.decisionTypeId).subscribe(
                    res => {
                        this.decisionType = res;
                    },
                    error => {
                    });
            }
        },
        error => {
        });
    }

    hasError(decisionTypeForm: NgForm, field: string, validation: string) {
		if (decisionTypeForm && Object.keys(decisionTypeForm.form.controls).length > 0 && decisionTypeForm.form.controls[field] &&
			decisionTypeForm.form.controls[field].errors && validation in decisionTypeForm.form.controls[field].errors) {
            if (validation) {
				return (decisionTypeForm.form.controls[field].dirty &&
					decisionTypeForm.form.controls[field].errors[validation]) || (this.edit && decisionTypeForm.form.controls[field].errors[validation]);
            }
			return (decisionTypeForm.form.controls[field].dirty &&
				decisionTypeForm.form.controls[field].invalid) || (this.edit && decisionTypeForm.form.controls[field].invalid);
        }
    }

    save(decisonTypeForm: NgForm) {
        this.submitted = true;
        this.edit = true;

        if (decisonTypeForm.valid) { // submit form if valid
            if (this.decisionTypeId) { // if edit
                this._crudService.edit<DecisionType>('admin/decision-types', this.decisionType, this.decisionTypeId).subscribe(
                    data => {
                        this.layoutUtilsService.showActionNotification(this.translate.instant('DECISION_TYPES.ADD.EDIT_MESSAGE'), MessageType.Read);
						this.router.navigate(['/decision-types']);
                    },
                    error => {
                        this.layoutUtilsService.showActionNotification(this.isArabic? error.error_ar : error.error, MessageType.Read);
                        this.submitted = false;
                    });
            } else { // if add
                // console.log(this.role);
                this._crudService.add<DecisionType>('admin/decision-types', this.decisionType).subscribe(
                    data => {
                        this.layoutUtilsService.showActionNotification(this.translate.instant('DECISION_TYPES.ADD.ADD_MESSAGE'), MessageType.Read);
						this.router.navigate(['/decision-types']);
                    },
                    error => {
                        this.layoutUtilsService.showActionNotification(this.isArabic? error.error_ar : error.error, MessageType.Read);
                        this.submitted = false;
                    });
            }
        } else {
            this.submitted = false;
        }
    }

    getLanguage() {
		this.isArabic = this._translationService.isArabic();
    }

    redirect() {
        this.router.navigate(['/decision-types']);
    }
}
