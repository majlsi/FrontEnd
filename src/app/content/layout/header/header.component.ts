import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { HeaderService } from '../../../core/services/layout/header.service';
import { NavigationCancel, NavigationEnd, NavigationStart, RouteConfigLoadEnd, RouteConfigLoadStart, Router } from '@angular/router';
import { LayoutRefService } from '../../../core/services/layout/layout-ref.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { UserService } from '../../../core/services/security/users.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
	selector: 'm-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default
})
export class HeaderComponent implements OnInit, AfterViewInit {

	organizationNameAr: string = '';
	organizationNameEn: string = '';
	isArabic: boolean;

	constructor(
		private el: ElementRef,
		private router: Router,
		private layoutRefService: LayoutRefService,
		public headerService: HeaderService,
		public loader: LoadingBarService,
		private _userService: UserService,
		private _translationService: TranslationService,
	) {
		// page progress bar percentage
		this.router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				// set page progress bar loading to start on NavigationStart event router
				this.loader.start();
			}
			if (event instanceof RouteConfigLoadStart) {
				this.loader.increment(35);
			}
			if (event instanceof RouteConfigLoadEnd) {
				this.loader.increment(75);
			}
			if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
				// set page progress bar loading to end on NavigationEnd event router
				this.loader.complete();
			}
		});
	}

	ngOnInit(): void {
		this.getCurrentUser();
		this.getLanguage();

	}

	ngAfterViewInit(): void {
		// keep header element in the service
		this.layoutRefService.addElement('header', this.el.nativeElement);
	}

	getCurrentUser() {
		this._userService.getCurrentUser().subscribe(res => {
			if (res.user.organization) {
				this.organizationNameAr = res.user.organization.organization_name_ar;
				this.organizationNameEn = res.user.organization.organization_name_en;
			}

		}, error => {

		});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}
}
