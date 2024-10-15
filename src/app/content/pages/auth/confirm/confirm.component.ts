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
import { environment } from '../../../../../environments/environment';
@Component({
	selector: 'm-confirm',
	templateUrl: './confirm.component.html',
	styleUrls: ['./confirm.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default,
	host: {
	  class: 'lc-grid__item--wrapper'
	}
})
export class ConfirmComponent implements OnInit, OnDestroy {
	public model: any = { username: '', password: '' };
	@Output() actionChange = new Subject<string>();
	public loading = false;

	@Input() action: string;

	@ViewChild('f') f: NgForm;
	errors: any = [];
	themeName = environment.themeName;

	spinner: SpinnerButtonOptions = {
		active: false,
		spinnerSize: 18,
		raised: true,
		buttonColor: 'primary',
		spinnerColor: 'accent',
		fullWidth: false
	};

	returnUrl: string;

	constructor(
		private authService: AuthenticationService,
		private router: Router,
		public authNoticeService: AuthNoticeService,
		private translate: TranslateService,
		private cdr: ChangeDetectorRef,
		private route: ActivatedRoute
	) { }


	ngOnInit(): void {
		// demo message to show
		if (!this.authNoticeService.onNoticeChanged$.getValue()) {
			this.authNoticeService.setNotice(null);
		}

		this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
	}

	ngOnDestroy(): void {
		this.authNoticeService.setNotice(null);
	}


	forgotPasswordPage(event: Event) {
		this.action = 'forgot-password';
		this.actionChange.next(this.action);
	}

	register(event: Event) {
		this.action = 'register';
		this.actionChange.next(this.action);
	}
}
