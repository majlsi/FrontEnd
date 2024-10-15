import { AuthenticationService } from '../../../../../core/auth/authentication.service';
import { ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
	selector: 'm-user-signout',
	templateUrl: './user-signout.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class UserSignoutComponent implements OnInit {
	@HostBinding('class')
	// tslint:disable-next-line:max-line-length
	classes = 'm-nav__item m-dropdown m-dropdown--medium m-dropdown--arrow m-dropdown--header-bg-fill m-dropdown--align-right m-dropdown--mobile-full-width m-dropdown--skin-light';

	@HostBinding('attr.m-dropdown-toggle') attrDropdownToggle = 'click';

	// @Input() avatar: string = './assets/app/media/img/users/user4.jpg';
	// @Input() avatarBg: SafeStyle = '';

	@ViewChild('mProfileDropdown') mProfileDropdown: ElementRef;

	constructor (
		private router: Router,
		private authService: AuthenticationService,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit (): void {
	}

	public logout () {
		this.authService.logout(true);
	}
}
