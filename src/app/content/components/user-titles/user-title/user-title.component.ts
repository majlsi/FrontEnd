import {Component, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { UserTitle } from '../../../../core/models/user-title';

@Component({
   selector: 'm-user-title',
   templateUrl: './user-title.component.html',
   changeDetection: ChangeDetectionStrategy.Default
})
export class UserTitleComponent implements OnInit {

    userTitle = new UserTitle();
    submitted: boolean = false;
    userTitleId: number;
    edit: boolean = false;

    constructor(private _crudService: CrudService, private route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService) {

    }

	ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.userTitleId = +params['id']; // (+) converts string 'id' to a number
                this._crudService.get<UserTitle>('admin/user-titles', this.userTitleId).subscribe(
                    res => {
                        this.userTitle = res;
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

    hasError(userTitleForm: NgForm, field: string, validation: string) {
		if (userTitleForm && Object.keys(userTitleForm.form.controls).length > 0 && userTitleForm.form.controls[field] &&
			userTitleForm.form.controls[field].errors && validation in userTitleForm.form.controls[field].errors) {
            if (validation) {
				return (userTitleForm.form.controls[field].dirty &&
					userTitleForm.form.controls[field].errors[validation]) || (this.edit && userTitleForm.form.controls[field].errors[validation]);
            }
			return (userTitleForm.form.controls[field].dirty &&
				userTitleForm.form.controls[field].invalid) || (this.edit && userTitleForm.form.controls[field].invalid);
        }
    }

    save(userTitleForm: NgForm) {
        this.submitted = true;
        this.edit = true;

        if (userTitleForm.valid) { // submit form if valid
            if (this.userTitleId) { // if edit
                this._crudService.edit<UserTitle>('admin/user-titles', this.userTitle, this.userTitleId).subscribe(
                    data => {
						this.router.navigate(['/user-titles']);
                    },
                    error => {
                        this.submitted = false;
                    });
            } else { // if add
                // console.log(this.role);
                this._crudService.add<UserTitle>('admin/user-titles', this.userTitle).subscribe(
                    data => {
						this.router.navigate(['/user-titles']);
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
        this.router.navigate(['/user-titles']);
    }

}
