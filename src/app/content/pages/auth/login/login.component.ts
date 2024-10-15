import {
	Component,
	OnInit,
	Output,
	Input,
	ViewChild,
	OnDestroy,
	ChangeDetectionStrategy,
	ChangeDetectorRef
} from '@angular/core';
import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { Router , ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { NgForm } from '@angular/forms';
import * as objectPath from 'object-path';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerButtonOptions } from '../../../partials/content/general/spinner-button/button-options.interface';
import { TranslationService } from '../../../../core/services/translation.service';
import { environment } from '../../../../../environments/environment';
import {TokenSessionService} from '../../../../core/auth/token-session.service';
@Component({
	selector: 'm-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	host: {
	  class: 'lc-grid__item--wrapper'
	}
})
export class LoginComponent implements OnInit, OnDestroy {
	public model: any = { username: '', password: '' };
	@Output() actionChange = new Subject<string>();
	public loading = false;

	@Input() action: string;
	themeName = environment.themeName;
	edit: boolean = false;
	submitted: boolean = false;

	returnUrl: string;
	tokenExists: boolean = false;
	isArabic: boolean;

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		public authNoticeService: AuthNoticeService,
		public tokenSessionService: TokenSessionService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute,
		private _translationService: TranslationService
	) { }

	submit(loginForm: NgForm) {
		this.edit = true;
		this.submitted = true;

		if (loginForm.valid) {
			this.authService.login(this.model).subscribe(response => {
				if (typeof response !== 'undefined') {
					if (response.hasTwoFactorAuth === 1) {
						this.tokenSessionService.setLoginResponseData(response);
						this.router.navigate(['/notification-options']);
					} else if (response.mainRightUrl) {
						this.router.navigate([response.mainRightUrl]);

					} else {
						this.router.navigate([this.returnUrl]);
					}
				} else {
					this.authNoticeService.setNotice(this.translate.instant('AUTH.VALIDATION.INVALID_LOGIN'), 'error');
				}
				this.submitted = false;
				this.cdr.detectChanges();
			},
			error => {
				if (this.isArabic) {
					this.authNoticeService.setNotice(error.error.error_ar, 'error');

				} else {
					this.authNoticeService.setNotice(error.error.error, 'error');

				}
				this.submitted = false;
				this.cdr.detectChanges();
			});
		} else {
			this.submitted = false;
		}
	}

	ngOnInit(): void {
		this.getLanguage();
		// demo message to show
		if (!this.authNoticeService.onNoticeChanged$.getValue()) {
			this.authNoticeService.setNotice(null);
		} else {
			this.authNoticeService.setNotice(null);
		}
		this.tokenExists = this.checkToken();
		if (this.tokenExists === true) {
			this.router.navigate(['/']);

		}
		this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
	}

	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
	}

	hasError(loginForm: NgForm, field: string, validation: string) {
        if (loginForm && Object.keys(loginForm.form.controls).length > 0 &&
            loginForm.form.controls[field].errors && validation in loginForm.form.controls[field].errors) {
                if (validation) {
                return (loginForm.form.controls[field].dirty &&
					loginForm.form.controls[field].errors[validation]) ||
					(this.edit && loginForm.form.controls[field].errors[validation]);
            }
            return (loginForm.form.controls[field].dirty &&
                loginForm.form.controls[field].invalid) || (this.edit && loginForm.form.controls[field].invalid);
        }
	}
	checkToken(): boolean {
		if (localStorage.getItem('accessToken')) {
			return true;
		} else {
			return false;
		}
	}

	changeAfterSubmit() {
		if (this.edit) {
			this.authNoticeService.setNotice(null);
		}
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
    }
}
