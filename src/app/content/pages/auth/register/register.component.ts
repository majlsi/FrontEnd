import {
	Component,
	OnInit,
	Input,
	Output,
	ViewChild,
	ElementRef
} from '@angular/core';
import { NgForm } from '@angular/forms';
import * as objectPath from 'object-path';
import { SpinnerButtonOptions } from '../../../partials/content/general/spinner-button/button-options.interface';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Observable , of, Subject} from 'rxjs';

// Service
import { UploadService } from '../../../../core/services/shared/upload.service';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { AuthenticationService } from '../../../../core/auth/authentication.service';
import { TranslationService } from '../../../../core/services/translation.service';
// Models
import { User } from '../../../../core/models/user';
import { Organization } from '../../../../core/models/organization';
import { Image } from '../../../../core/models/image';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TimeZone } from '../../../../core/models/time-zone';
import { environment } from '../../../../../environments/environment';
@Component({
	selector: 'm-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss'],
	host: {
	  class: 'lc-grid__item--wrapper'
	}
})
export class RegisterComponent implements OnInit {

	user = new User();
	// logoImageChangedEvent: any ;
	// logoImageUrlObs: Observable<any>;
	image_url: string;
	@Input() action: string;
	@Output() actionChange = new Subject<string>();
	public loading = false;
	themeName = environment.themeName;
	edit: boolean = false;
	submitted: boolean = false;
	registerErrorHide: boolean = true;
	error: any;
	fileTypeError: boolean = false;
	fileExtensions: Array<String> = ['jpeg', 'jpg', 'png'];
	// logoImageSizeError: string = '';
	isArabic: boolean;
	timeZones: TimeZone[];

	constructor(
		private authService: AuthenticationService,
		public authNoticeService: AuthNoticeService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		private _uploadService: UploadService,
		private router: Router,
		private _crudService: CrudService
	) {}

	ngOnInit() {
		this.user.organization = new Organization();
		// this.user.organization.logo_image = new Image();
		this.isArabic = this._translationService.isArabic();
		// this.getSystemTimeZones();

	}


	submit(registerForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		this.registerErrorHide = true;
		if (registerForm.valid ) {
			if (this.user.password === this.user.rpassword) {
				// if (this.logoImageChangedEvent) {
				// 	this.imageUploader(this.logoImageChangedEvent);
				// }
				// forkJoin([this.logoImageUrlObs]).subscribe(data => {
				// 	this.user.organization.logo_image.original_image_url = data[0].url;
				// 	this.user.organization.logo_image.image_url = data[0].url;
					this.authService.register(this.user).subscribe(response => {
						this.action = 'confirm';
						this.router.navigate(['/confirm']);
						this.actionChange.next(this.action);
						this.submitted = false;
					}, err => {
						this.submitted = false;
						this.registerErrorHide = false;
						this.error = err.error.error;
					});
				// }, error => {
				// 	this.logoImageSizeError = this.translate.instant('AUTH.VALIDATION.IMAGE_SIZE_ERROR');
                //     this.submitted = false;
				// });
			} else {
				this.submitted = false;
			}
		} else {
			this.submitted = false;
		}
	}

	hasError(registerForm: NgForm, field: string, validation: string) {
        if (registerForm && Object.keys(registerForm.form.controls).length > 0 &&
            registerForm.form.controls[field].errors && validation in registerForm.form.controls[field].errors) {
                if (validation) {
                return (registerForm.form.controls[field].dirty &&
					registerForm.form.controls[field].errors[validation]) ||
					(this.edit && registerForm.form.controls[field].errors[validation]);
            }
            return (registerForm.form.controls[field].dirty &&
                registerForm.form.controls[field].invalid) || (this.edit && registerForm.form.controls[field].invalid);
        }
	}

  	// detectFiles(event) {
	// 	this.logoImageSizeError = '';
	// 	const extension = event.target.files[0].name.split('.');
	// 	if (this.fileExtensions.includes(extension[extension.length - 1].toLowerCase()) ) {
	// 		this.logoImageChangedEvent = event.target.files[0];
	// 		if (event.target.files[0]) {
	// 		  const reader = new FileReader();
	// 		  reader.onload = (e: any) => {
	// 			  this.image_url = e.target.result;
	// 		  };
	// 		  reader.readAsDataURL(event.target.files[0]);
	// 		}
	// 		this.fileTypeError = false;
	// 	} else {
	// 		this.image_url = '';
	// 		this.fileTypeError = true;
	// 	}
  	// }

	// imageUploader(image: File) {
	// 	if (image) {
	// 		this.logoImageUrlObs = this._uploadService.upload<File>('upload', image , '/organizations');
	// 	}
	// }


	// getSystemTimeZones() {
	// 	this._crudService.getList<TimeZone>('time-zones/system-time-zones').subscribe(res => {
	// 		this.timeZones = res;
	// 	});
	// }

}
