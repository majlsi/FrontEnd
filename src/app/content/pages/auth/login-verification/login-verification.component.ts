import {
    Component,
    OnInit
} from '@angular/core';

import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { NgForm } from '@angular/forms';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { SpinnerButtonOptions } from '../../../partials/content/general/spinner-button/button-options.interface';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenSessionService } from '../../../../core/auth/token-session.service';
import { TranslationService } from '../../../../core/services/translation.service';
@Component({
    selector: 'm-login-verification',
    templateUrl: './login-verification.component.html',
    styleUrls: ['./login-verification.component.scss'],
    host: {
        class: 'lc-grid__item--wrapper'
    }
})
export class LoginVerificationComponent implements OnInit {

    public model: any = { verificationCode: '' };
    public loading = false;
    edit: boolean = false;
    submitted: boolean = false;
    themeName = environment.themeName;
    returnUrl: string;
    notificationOptionId: number;
    isArabic: boolean = false;

    constructor(
        private authService: AuthenticationService,
        public authNoticeService: AuthNoticeService,
        private translate: TranslateService,
        private router: Router,
        private route: ActivatedRoute,
        private tokenSessionService: TokenSessionService,
        private _translationService: TranslationService
    ) { }

    ngOnInit() {
        this.getLanguage();
        this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
        this.notificationOptionId = this.route.snapshot.queryParamMap.get('notificationOptionId')? + this.route.snapshot.queryParamMap.get('notificationOptionId') : 1;

        if ((this.route.snapshot.queryParamMap.get('token') == null ||
            this.route.snapshot.queryParamMap.get('token') === '') &&
            !this.tokenSessionService.getAccessToken()) {

            this.router.navigate(['/login']);
        } else if (!this.tokenSessionService.getAccessToken()) {
            this.tokenSessionService.setLoginResponseData({ 'token': this.route.snapshot.queryParamMap.get('token') });

            if (this.route.snapshot.queryParamMap.get('code') != null &&
                this.route.snapshot.queryParamMap.get('code') !== '') {
                this.model.verificationCode = this.route.snapshot.queryParamMap.get('code');
                this.validate();
            }
        }
    }

    submit(verificationCodeForm: NgForm) {
        this.edit = true;
        this.submitted = true;
        this.authNoticeService.setNotice(null);
        if (verificationCodeForm.valid) {
            this.validate();
        } else {
            this.submitted = false;
        }
    }

    validate() {
        this.authService.validateVerificationCode(this.model).subscribe(response => {
            if (typeof response !== 'undefined') {
                if (response.mainRightUrl) {
                    this.router.navigate([response.mainRightUrl]);

                } else {
                    this.router.navigate([this.returnUrl]);
                }
            }
            this.submitted = false;
        },
            error => {
                if (error.error === 'token_not_provided') {
                    this.authNoticeService.setNotice(this.translate.instant('AUTH.VERIFY.NOTVALIDLINK'), 'error');

                } else {
                    this.authNoticeService.setNotice(this.translate.instant('AUTH.VERIFY.NOTVALIDCODE'), 'error');
                }

                this.submitted = false;

            });
    }

    hasError(verificationCodeForm: NgForm, field: string, validation: string) {
        if (verificationCodeForm && Object.keys(verificationCodeForm.form.controls).length > 0 &&
            verificationCodeForm.form.controls[field].errors && validation in verificationCodeForm.form.controls[field].errors) {
            if (validation) {
                return (verificationCodeForm.form.controls[field].dirty &&
                    verificationCodeForm.form.controls[field].errors[validation]) ||
                    (this.edit && verificationCodeForm.form.controls[field].errors[validation]);
            }
            return (verificationCodeForm.form.controls[field].dirty &&
                verificationCodeForm.form.controls[field].invalid) || (this.edit && verificationCodeForm.form.controls[field].invalid);
        }
    }

    resendCode() {
        this.authNoticeService.setNotice(null);
        const lang = this.isArabic? 'ar' : 'en';
        this.authService.sendCodeNotification({notification_option_id: this.notificationOptionId, lang: lang}).subscribe(res => {
            this.authNoticeService.setNotice(this.isArabic? res.message_ar : res.message, 'success');    
        }, error => {
            this.authNoticeService.setNotice(this.isArabic? error.error.error_ar : error.error.error, 'error');    
        });
    }

    getLanguage() {
		this.isArabic = this._translationService.isArabic();
    }
}
