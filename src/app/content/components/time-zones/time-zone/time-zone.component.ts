import {Component, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { TimeZone } from '../../../../core/models/time-zone';

@Component({
   selector: 'm-time-zone',
   templateUrl: './time-zone.component.html',
   changeDetection: ChangeDetectionStrategy.Default
})
export class TimeZoneComponent implements OnInit {

    submitted: boolean = false;
    edit: boolean = false;
    timeZone = new TimeZone();
    timeZoneId: number;

    constructor(private _crudService: CrudService, private route: ActivatedRoute, private router: Router ,
        private translate: TranslateService
        ) {

    }
	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.timeZoneId = +params['id']; // (+) converts string 'id' to a number
				this._crudService.get<TimeZone>('admin/time-zones', this.timeZoneId).subscribe(
				res => {
                    this.timeZone = res;
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

    hasError(timeZoneForm: NgForm, field: string, validation: string) {
		if (timeZoneForm && Object.keys(timeZoneForm.form.controls).length > 0 && timeZoneForm.form.controls[field] &&
			timeZoneForm.form.controls[field].errors && validation in timeZoneForm.form.controls[field].errors) {
            if (validation) {
				return (timeZoneForm.form.controls[field].dirty &&
					timeZoneForm.form.controls[field].errors[validation]) || (this.edit && timeZoneForm.form.controls[field].errors[validation]);
            }
			return (timeZoneForm.form.controls[field].dirty &&
				timeZoneForm.form.controls[field].invalid) || (this.edit && timeZoneForm.form.controls[field].invalid);
        }
	}

    save(timeZoneForm: NgForm) {
        this.submitted = true;
        this.edit = true;

        if (timeZoneForm.valid) { // submit form if valid
            if (this.timeZoneId) { // if edit
                this._crudService.edit<TimeZone>('admin/time-zones', this.timeZone, this.timeZoneId).subscribe(
                    data => {
						this.router.navigate(['/time-zones']);
                    },
                    error => {
                        this.submitted = false;
                    });
            } else { // if add
                this._crudService.add<TimeZone>('admin/time-zones', this.timeZone).subscribe(
                    data => {
						this.router.navigate(['/time-zones']);
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
        this.router.navigate(['/time-zones']);
    }
}
