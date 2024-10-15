import {
	Component,
	OnInit,
	Output,
	Input,
	ViewChild,
	OnDestroy,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	HostBinding
} from '@angular/core';
import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { Router , ActivatedRoute} from '@angular/router';
import { Subject } from 'rxjs';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { NgForm } from '@angular/forms';
import * as objectPath from 'object-path';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerButtonOptions } from '../../../partials/content/general/spinner-button/button-options.interface';
import { LayoutConfigService } from '../../../../core/services/layout-config.service';
import { LayoutConfig } from '../../../../config/layout';
import { ResetPassword } from '../../../../core/models/reset-password';
import { TranslationService } from '../../../../core/services/translation.service';
import { environment } from '../../../../../environments/environment';
@Component({
	selector: 'm-reset-password',
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	host: {
	  class: 'lc-grid__item--wrapper'
	}
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
	public model: ResetPassword = { password: '', password_confirmation: '' , token: '' };
	@Output() actionChange = new Subject<string>();
	public loading = false;
	resetCompleted: boolean = false;
	@Input() action: string;

	edit: boolean = false;
	submitted: boolean = false;
	isArabic: boolean;
	themeName = environment.themeName;
	@HostBinding('id') id = 'm_login';
	@HostBinding('class')

	classses: any = 'm-grid__item m-grid__item--fluid m-grid m-grid--hor m-login m-login--signin m-login--2 m-login-2--skin-2';
	today: number = Date.now();

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		public authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute,
		private layoutConfigService: LayoutConfigService,
		private _translationService: TranslationService

	) { }

	submit(resetPasswordForm: NgForm) {
		this.edit = true;
		this.submitted = true;

		if (resetPasswordForm.valid) {
			this.authService.resetPassword(this.model).subscribe(response => {
				if (typeof response !== 'undefined') {
					if (this.isArabic === true) {
						this.authNoticeService.setNotice(response.message.message_ar, 'success');
					} else {
						this.authNoticeService.setNotice(response.message.message, 'success');
					}
					this.resetCompleted = true;
				}
				this.submitted = false;
			},
				error => {
					if (this.isArabic === true) {
						this.authNoticeService.setNotice(error.error.error.message_ar? error.error.error.message_ar : error.error.error_ar, 'error');
					} else {
						this.authNoticeService.setNotice(error.error.error.message? error.error.error.message : error.error.error, 'error');
					}
				this.submitted = false;

			});
		} else {
			this.submitted = false;
		}
	}

	ngOnInit(): void {
		this.getLanguage();
		// set login layout to blank
		this.layoutConfigService.setModel(new LayoutConfig({ content: { skin: '' } }), true);

		// demo message to show
		if (!this.authNoticeService.onNoticeChanged$.getValue()) {
			this.authNoticeService.setNotice(null);
		}

		if (this.route.snapshot.queryParamMap.get('token') == null || this.route.snapshot.queryParamMap.get('token') === '') {
			this.router.navigate(['404']);
		} else {
			this.model.token = this.route.snapshot.queryParamMap.get('token');
		}

	}

	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
	}

	hasError(resetPasswordForm: NgForm, field: string, validation: string) {
        if (resetPasswordForm && Object.keys(resetPasswordForm.form.controls).length > 0 &&
            resetPasswordForm.form.controls[field].errors && validation in resetPasswordForm.form.controls[field].errors) {
                if (validation) {
                return (resetPasswordForm.form.controls[field].dirty &&
					resetPasswordForm.form.controls[field].errors[validation]) ||
					(this.edit && resetPasswordForm.form.controls[field].errors[validation]);
            }
            return (resetPasswordForm.form.controls[field].dirty &&
                resetPasswordForm.form.controls[field].invalid) || (this.edit && resetPasswordForm.form.controls[field].invalid);
        }
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
    }
}
