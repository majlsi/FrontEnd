import {Component, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { MeetingType } from '../../../../core/models/meeting-type';

@Component({
   selector: 'm-meeting-type',
   templateUrl: './meeting-type.component.html',
   changeDetection: ChangeDetectionStrategy.Default
})
export class MeetingTypeComponent implements OnInit {

    meetingType = new MeetingType();
    submitted: boolean = false;
    meetingTypeId: number;
    edit: boolean = false;

    constructor(private _crudService: CrudService, private route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService) {

    }

	ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.meetingTypeId = +params['id']; // (+) converts string 'id' to a number
                this._crudService.get<MeetingType>('admin/meeting-types', this.meetingTypeId).subscribe(
                    res => {
                        this.meetingType = res;
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

    hasError(meetingtypeForm: NgForm, field: string, validation: string) {
		if (meetingtypeForm && Object.keys(meetingtypeForm.form.controls).length > 0 && meetingtypeForm.form.controls[field] &&
			meetingtypeForm.form.controls[field].errors && validation in meetingtypeForm.form.controls[field].errors) {
            if (validation) {
				return (meetingtypeForm.form.controls[field].dirty &&
					meetingtypeForm.form.controls[field].errors[validation]) || (this.edit && meetingtypeForm.form.controls[field].errors[validation]);
            }
			return (meetingtypeForm.form.controls[field].dirty &&
				meetingtypeForm.form.controls[field].invalid) || (this.edit && meetingtypeForm.form.controls[field].invalid);
        }
    }

    save(meetingtypeForm: NgForm) {
        this.submitted = true;
        this.edit = true;

        if (meetingtypeForm.valid) { // submit form if valid
            if (this.meetingTypeId) { // if edit
                this._crudService.edit<MeetingType>('admin/meeting-types', this.meetingType, this.meetingTypeId).subscribe(
                    data => {
						this.router.navigate(['/meeting-types']);
                    },
                    error => {
                        this.submitted = false;
                    });
            } else { // if add
                // console.log(this.role);
                this._crudService.add<MeetingType>('admin/meeting-types', this.meetingType).subscribe(
                    data => {
						this.router.navigate(['/meeting-types']);
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
        this.router.navigate(['/meeting-types']);
    }

}
