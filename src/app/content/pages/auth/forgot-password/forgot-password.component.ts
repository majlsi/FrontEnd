import {
	Component,
	OnInit,
	Input,
	Output,
	ViewChild,
	ElementRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { NgForm } from '@angular/forms';
import * as objectPath from 'object-path';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { SpinnerButtonOptions } from '../../../partials/content/general/spinner-button/button-options.interface';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
@Component({
	selector: 'm-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.scss'],
	host: {
	  class: 'lc-grid__item--wrapper'
	}
})
export class ForgotPasswordComponent implements OnInit {
	public model: any = { username: '' };
	@Input() action: string;
	@Output() actionChange = new Subject<string>();
	public loading = false;

	edit: boolean = false;
	submitted: boolean = false;
	themeName = environment.themeName;
	constructor(
		private authService: AuthenticationService,
		public authNoticeService: AuthNoticeService,
		private translate: TranslateService
	) {}

	ngOnInit() {}

	loginPage(event: Event) {
		event.preventDefault();
		this.action = 'login';
		this.actionChange.next(this.action);
		this.authNoticeService.setNotice(null);
	}

	submit(forgotPasswordForm: NgForm) {
		this.edit = true;
		this.submitted = true;

		this.authNoticeService.setNotice(null);
		if (forgotPasswordForm.valid) {
			this.authService.requestPassword(this.model).subscribe(response => {
				if (typeof response !== 'undefined') {
				this.authNoticeService.setNotice(this.translate.instant('AUTH.FORGOT.EMAILSENT'), 'success');

				}
				this.submitted = false;
			},
			error => {
				this.authNoticeService.setNotice(this.translate.instant('AUTH.FORGOT.NOTREGISTERD'), 'error');
				this.submitted = false;

			});
		} else {
			this.submitted = false;
		}
	}

	hasError(forgotPasswordForm: NgForm, field: string, validation: string) {
        if (forgotPasswordForm && Object.keys(forgotPasswordForm.form.controls).length > 0 &&
            forgotPasswordForm.form.controls[field].errors && validation in forgotPasswordForm.form.controls[field].errors) {
                if (validation) {
                return (forgotPasswordForm.form.controls[field].dirty &&
					forgotPasswordForm.form.controls[field].errors[validation]) ||
					(this.edit && forgotPasswordForm.form.controls[field].errors[validation]);
            }
            return (forgotPasswordForm.form.controls[field].dirty &&
                forgotPasswordForm.form.controls[field].invalid) || (this.edit && forgotPasswordForm.form.controls[field].invalid);
        }
	}
}
