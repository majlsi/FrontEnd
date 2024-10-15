import {Component, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';

// Models
import { Nickname } from '../../../../core/models/nickname';

@Component({
   selector: 'm-nickname',
   templateUrl: './nickname.component.html',
   changeDetection: ChangeDetectionStrategy.Default
})
export class NicknameComponent implements OnInit {

    nickname = new Nickname();
    submitted: boolean = false;
    nicknameId: number;
    edit: boolean = false;

    constructor(private _crudService: CrudService, private route: ActivatedRoute,
        private router: Router,
        private translate: TranslateService) {

    }

	ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.nicknameId = +params['id']; // (+) converts string 'id' to a number
                this._crudService.get<Nickname>('admin/nicknames', this.nicknameId).subscribe(
                    res => {
                        this.nickname = res;
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

    hasError(niknameForm: NgForm, field: string, validation: string) {
		if (niknameForm && Object.keys(niknameForm.form.controls).length > 0 && niknameForm.form.controls[field] &&
			niknameForm.form.controls[field].errors && validation in niknameForm.form.controls[field].errors) {
            if (validation) {
				return (niknameForm.form.controls[field].dirty &&
					niknameForm.form.controls[field].errors[validation]) || (this.edit && niknameForm.form.controls[field].errors[validation]);
            }
			return (niknameForm.form.controls[field].dirty &&
				niknameForm.form.controls[field].invalid) || (this.edit && niknameForm.form.controls[field].invalid);
        }
    }

    save(niknameForm: NgForm) {
        this.submitted = true;
        this.edit = true;

        if (niknameForm.valid) { // submit form if valid
            if (this.nicknameId) { // if edit
                this._crudService.edit<Nickname>('admin/nicknames', this.nickname, this.nicknameId).subscribe(
                    data => {
						this.router.navigate(['/nicknames']);
                    },
                    error => {
                        this.submitted = false;
                    });
            } else { // if add
                this._crudService.add<Nickname>('admin/nicknames', this.nickname).subscribe(
                    data => {
						this.router.navigate(['/nicknames']);
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
        this.router.navigate(['/nicknames']);
    }

}
