import {
    Component,
    OnInit
} from '@angular/core';

import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { NgForm } from '@angular/forms';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenSessionService } from '../../../../core/auth/token-session.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
    selector: 'm-login-notification-options',
    templateUrl: './login-notification-options.component.html',
    styleUrls: ['./login-notification-options.component.scss'],
    host: {
        class: 'lc-grid__item--wrapper'
    }
})
export class LoginNotificationOptionsComponent
implements OnInit {

    public loading = false;
    edit: boolean = false;
    submitted: boolean = false;
    themeName = environment.themeName;
    returnUrl: string;
    notificationOptions: Array<any> = [];
    isArabic: boolean;
    notificationOptionId: number = 1;

    constructor(
        private authService: AuthenticationService,
        public authNoticeService: AuthNoticeService,
        private translate: TranslateService,
        private router: Router,
        private route: ActivatedRoute,
        private tokenSessionService: TokenSessionService,
        private _crudService: CrudService,
        private _translationService: TranslationService
    ) { }

    ngOnInit() {
        this.getLanguage();
        this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';

        if ((this.route.snapshot.queryParamMap.get('token') == null ||
            this.route.snapshot.queryParamMap.get('token') === '') &&
            !this.tokenSessionService.getAccessToken()) {
            this.router.navigate(['/login']);
        } else {
            this.getNotificationOptions();
        }
    }

    getNotificationOptions() {
        this._crudService.getList('notification-options').subscribe(res => {
            this.notificationOptions = res;
        }, error => {
        });
    }

    submit(verificationCodeForm: NgForm) {
        this.edit = true;
        this.submitted = true;
        this.authNoticeService.setNotice(null);
        if (this.notificationOptionId) {
            if (verificationCodeForm.valid) {
                // send notification
                const lang = this.isArabic? 'ar' : 'en';
                this.authService.sendCodeNotification({notification_option_id: this.notificationOptionId, lang: lang}).subscribe(response => {
                    this.authNoticeService.setNotice(this.isArabic? response.message_ar : response.message, 'success');    
                    this.submitted = false;
                    this.router.navigate(['/verify'],{ queryParams: { notificationOptionId: this.notificationOptionId } });
                },
                    error => {
                        this.authNoticeService.setNotice(this.isArabic? error.error.error_ar : error.error.error, 'error');    
                        this.submitted = false;
        
                    });
            } else {
                this.submitted = false;
            }
        } else {
            this.submitted = false;  
        }
    }

    hasError(optionsForm: NgForm, field: string, validation: string) {
        if (optionsForm && Object.keys(optionsForm.form.controls).length > 0 &&
            optionsForm.form.controls[field].errors && validation in optionsForm.form.controls[field].errors) {
            if (validation) {
                return (optionsForm.form.controls[field].dirty &&
                    optionsForm.form.controls[field].errors[validation]) ||
                    (this.edit && optionsForm.form.controls[field].errors[validation]);
            }
            return (optionsForm.form.controls[field].dirty &&
                optionsForm.form.controls[field].invalid) || (this.edit && optionsForm.form.controls[field].invalid);
        }
    }

    getLanguage() {
		this.isArabic = this._translationService.isArabic();
    }
}
