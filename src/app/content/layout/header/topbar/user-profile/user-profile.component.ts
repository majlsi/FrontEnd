import { AuthenticationService } from '../../../../../core/auth/authentication.service';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

// Models
import { User } from '../../../../../core/models/user';

// Services
import { UserService } from '../../../../../core/services/security/users.service';
import { environment } from '../../../../../../environments/environment';
import { TranslationService } from '../../../../../core/services/translation.service';
import { HeaderService } from '../../../../../core/services/layout/header.service';

@Component({
	selector: 'm-user-profile',
	templateUrl: './user-profile.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class UserProfileComponent implements OnInit {
	@HostBinding('class')
	// tslint:disable-next-line:max-line-length
	classes = 'm-nav__item m-topbar__user-profile m-topbar__user-profile--img m-dropdown m-dropdown--medium m-dropdown--arrow m-dropdown--header-bg-fill m-dropdown--align-right m-dropdown--mobile-full-width m-dropdown--skin-light';

	@HostBinding('attr.m-dropdown-toggle') attrDropdownToggle = 'click';

	@Input() avatar: string = './assets/app/media/img/users/default_user.png';
	@Input() avatarBg: SafeStyle = '';

	@ViewChild('mProfileDropdown') mProfileDropdown: ElementRef;
	user = new User();
	imagesBaseURL: string = environment.imagesBaseURL;
	isArabic: boolean;
	profileImageUrl: string;
	userNameAr: string;
	userName: string;
	themeName = environment.themeName;
	constructor (
		private router: Router,
		private authService: AuthenticationService,
		private sanitizer: DomSanitizer,
		private _userService: UserService,
		private _translationService: TranslationService,
		private headerService: HeaderService
	) {}

	ngOnInit (): void {
		this.getLanguage();
		this.getCurrentUser();
		this.headerService.profileImage.subscribe((url) => {
			if (url) {
				this.profileImageUrl = url;
			}
		});
		this.headerService.nameAr.subscribe((name) => {
			if (name) {
				this.userNameAr = name;
			}
		});

		this.headerService.nameEn.subscribe((name) => {
			if (name) {
				this.userName = name;
			}
		});
		if (!this.avatarBg) {
			this.avatarBg = this.sanitizer.bypassSecurityTrustStyle('url(./assets/app/media/img/misc/'+this.themeName+'/user_profile_bg.jpg)');
		}
	}

	public logout () {
		this.authService.logout(true);
	}

	getCurrentUser() {
		this._userService.getCurrentUser().subscribe(res => {
			this.user = res.user;
			this.userNameAr = this.user.name_ar;
			this.userName = this.user.name;
			this.profileImageUrl = this.imagesBaseURL + this.user.image_url;
		}, error => {

		});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}
}
