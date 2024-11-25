
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';

import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LoginVerificationComponent } from './login-verification/login-verification.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateModule } from '@ngx-translate/core';
import { SpinnerButtonModule } from '../../partials/content/general/spinner-button/spinner-button.module';
import { AuthNoticeComponent } from './auth-notice/auth-notice.component';
import { CustomFormsModule } from 'ngx-custom-validators';
import { NgSelectModule } from '@ng-select/ng-select';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { environment } from '../../../../environments/environment';
import { LoginNotificationOptionsComponent } from './login-notification-options/login-notification-options.component';

const config: SocketIoConfig = { url: environment.redisListenURL, options: {} };
@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		MatButtonModule,
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		TranslateModule.forChild(),
		SpinnerButtonModule,
		RouterModule.forChild([
			{
				path: '',
				component: LoginComponent
			}
		]),
		CustomFormsModule,
		SocketIoModule.forRoot(config),
		NgSelectModule,
		MatRadioModule
	],
	providers: [],
	declarations: [
		AuthComponent,
		LoginComponent,
		RegisterComponent,
		ForgotPasswordComponent,
		ResetPasswordComponent,
		LoginVerificationComponent,
		LanguageSelectorComponent,
		ConfirmComponent,
		AuthNoticeComponent,
		LoginNotificationOptionsComponent,
	],
	exports: [ ResetPasswordComponent]
})
export class AuthModule {}
