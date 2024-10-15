import {Component, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { JobTitle } from '../../../../core/models/job-title';

@Component({
   selector: 'm-job-title',
   templateUrl: './job-title.component.html',
   changeDetection: ChangeDetectionStrategy.Default
})
export class JobTitleComponent implements OnInit {

    jobTitle = new JobTitle();
    submitted: boolean = false;
    jobTitleId: number;
    edit: boolean = false;

    constructor(private _crudService: CrudService, private route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService) {

    }

	ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.jobTitleId = +params['id']; // (+) converts string 'id' to a number
                this._crudService.get<JobTitle>('admin/job-titles', this.jobTitleId).subscribe(
                    res => {
                        this.jobTitle = res;
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

    hasError(jobTitleForm: NgForm, field: string, validation: string) {
		if (jobTitleForm && Object.keys(jobTitleForm.form.controls).length > 0 && jobTitleForm.form.controls[field] &&
			jobTitleForm.form.controls[field].errors && validation in jobTitleForm.form.controls[field].errors) {
            if (validation) {
				return (jobTitleForm.form.controls[field].dirty &&
					jobTitleForm.form.controls[field].errors[validation]) || (this.edit && jobTitleForm.form.controls[field].errors[validation]);
            }
			return (jobTitleForm.form.controls[field].dirty &&
				jobTitleForm.form.controls[field].invalid) || (this.edit && jobTitleForm.form.controls[field].invalid);
        }
    }

    save(jobTitleForm: NgForm) {
        this.submitted = true;
        this.edit = true;

        if (jobTitleForm.valid) { // submit form if valid
            if (this.jobTitleId) { // if edit
                this._crudService.edit<JobTitle>('admin/job-titles', this.jobTitle, this.jobTitleId).subscribe(
                    data => {
						this.router.navigate(['/job-titles']);
                    },
                    error => {
                        this.submitted = false;
                    });
            } else { // if add
                // console.log(this.role);
                this._crudService.add<JobTitle>('admin/job-titles', this.jobTitle).subscribe(
                    data => {
						this.router.navigate(['/job-titles']);
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
        this.router.navigate(['/job-titles']);
    }

}
