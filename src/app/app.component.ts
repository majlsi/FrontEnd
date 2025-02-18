import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostBinding, Inject, Input, OnInit, ViewChild,} from '@angular/core';
import {LayoutConfigService} from './core/services/layout-config.service';
import {ClassInitService} from './core/services/class-init.service';
import {TranslationService} from './core/services/translation.service';
import * as objectPath from 'object-path';
import {DomSanitizer, Title} from '@angular/platform-browser';
import {ActivatedRoute, ActivationEnd, NavigationEnd, Router} from '@angular/router';
import {PageConfigService} from './core/services/page-config.service';
import {filter} from 'rxjs/operators';
// declare var gtag;
import {SplashScreenService} from './core/services/splash-screen.service';
import {environment} from '../environments/environment';
import {DOCUMENT} from '@angular/common';
// language list
import {locale as enLang} from './config/i18n/en';
import {locale as arLang} from './config/i18n/ar';
import {locale as lijaniArLang} from './config/i18n/agencies/lijani/ar';
import {locale as lijaniEnLang} from './config/i18n/agencies/lijani/en';
import {locale as mjlsiArLang} from './config/i18n/agencies/mjlsi/ar';
import {locale as mjlsiEnLang} from './config/i18n/agencies/mjlsi/en';
import {locale as SWCCArLang} from './config/i18n/agencies/swcc/ar';
import {locale as SWCCEnLang} from './config/i18n/agencies/swcc/en';

// LIST KNOWN ISSUES
// [Violation] Added non-passive event listener; https://github.com/angular/angular/issues/8866
import Echo from 'laravel-echo';
import {UserService} from './core/services/security/users.service';
import {Observable} from 'rxjs';
import {NotificationService} from './core/services/notification/notification.service';
import {NotificationModelTypes} from './core/models/enums/notification-model-types';
import {FileService} from './core/services/files/file.service';
import {VideoGuideService} from './core/services/video-guide/video-guide.service';
import {ToastrService} from 'ngx-toastr';

declare global {
	interface Window {
		io: any;
	}

	interface Window {
		Echo: any;
	}
}

window.io = window.io || require('socket.io-client');
window.Echo = window.Echo || new Echo({
	broadcaster: 'socket.io',
	host: environment.redisListenURL,
	path: '/socket.io',
});

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'body[m-root]',
	templateUrl: './app.component.html',
	// styleUrls:['../assets/vendors/base/vendors.bundle.css','../assets/demo/default/base/style.bundle.css'],
	changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent implements AfterViewInit, OnInit {
	title = 'Metronic';
	vendorCSSUrl: string;
	baseStyleCSSUrl: string;
	layoutCSSUrl: string;
	customStyleCSSUrl: string;
	themeName = environment.themeName;
	themeTitleEn = environment.themeTitleEn;
	themeTitleAr = environment.themeTitleAr;
	@Input() attributes: any;

	@HostBinding('style') style: any;
	@HostBinding('class') classes: any = '';

	@ViewChild('splashScreen', {read: ElementRef})
	splashScreen: ElementRef;
	isArabic: boolean;
	userId: number;
	meetingGuestId: number;
	faviconLink: string;
	userObs: Observable<any>;
	isPresentation: boolean;

	constructor(
		private layoutConfigService: LayoutConfigService,
		private classInitService: ClassInitService,
		private sanitizer: DomSanitizer,
		private translationService: TranslationService,
		private router: Router,
		private pageConfigService: PageConfigService,
		private splashScreenService: SplashScreenService,
		private route: ActivatedRoute,
		public toastr: ToastrService,
		private _userService: UserService,
		private notificationService: NotificationService,
		private fileService: FileService,
		@Inject(DOCUMENT) private document,
		private titleService: Title,
		private videoGuideService: VideoGuideService
	) {

		const navEndEvent$ = router.events.pipe(
			filter(e => e instanceof NavigationEnd)
		);
		/*	navEndEvent$.subscribe((e: NavigationEnd) => {
				gtag('config', 'UA-159671967-1', { 'page_path': e.urlAfterRedirects });
			});*/

		// subscribe to class update event
		this.classInitService.onClassesUpdated$.subscribe(classes => {
			// get body class array, join as string classes and pass to host binding class
			setTimeout(() => this.classes = classes.body.join(' '));
		});

		// generate favicon
		if (this.themeName) {
			this.faviconLink = './assets/demo/default/media/img/logo/' + this.themeName + '/favicon.ico';
		} else {
			this.faviconLink = './assets/demo/default/media/img/logo/favicon.png';
		}

		document.getElementById('appFavicon').setAttribute('href', this.faviconLink);
		// subscribe to atrribute update event
		this.classInitService.onAttributeUpdated$.subscribe(attributes => {
			this.attributes = attributes.body;
			// TODO: print attribute to body
		});

		this.layoutConfigService.onLayoutConfigUpdated$.subscribe(model => {
			this.classInitService.setConfig(model);

			this.style = '';
			if (objectPath.get(model.config, 'self.layout') === 'boxed') {
				const backgroundImage = objectPath.get(model.config, 'self.background');
				if (backgroundImage) {
					this.style = this.sanitizer.bypassSecurityTrustStyle('background-image: url(' + objectPath.get(model.config, 'self.background') + ')');
				}
			}
		});

		// register translations
		this.setLanguage();
		this.isPresentation = false;
		// override config by router change from pages config
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe(event => {
				this.layoutConfigService.setModel({page: objectPath.get(this.pageConfigService.getCurrentPageConfig(), 'config')}, true);

			});
		this.router.events.subscribe((event: ActivationEnd) => {
			if (event instanceof ActivationEnd) {
				if (event.snapshot.data.isPresentation) {
					this.isPresentation = event.snapshot.data.isPresentation;
				}
			}
		});
	}

	ngOnInit(): void {
		this.listenToSystemNotificationChannel();
		this.route.queryParams.subscribe(queryParams => {
			const lang = queryParams.lang
				? queryParams.lang
				: ((queryParams.LanguageId && queryParams.LanguageId === '1')
					? 'ar' : ((queryParams.LanguageId && queryParams.LanguageId !== '1') ?
						'en' : null));
			const currentLang = localStorage.getItem('language');
			if (lang && currentLang !== lang) {
				this.translationService.setLanguage(lang);
				this.translationService.setAppLanguage(lang);
				this.document.documentElement.lang = lang;
			} else {
				this.document.documentElement.lang = currentLang;
			}
			this.getLanguage();

			this.isArabic = this.translationService.isArabic();
			// title change
			if (this.themeName && !this.isArabic) {
				this.titleService.setTitle(this.themeTitleEn);
				this.loadStyle('en-css.css');
				this.loadStyle(`${this.themeName}-en-css.css`, 'custom-theme');
			} else if (this.themeName && this.isArabic) {
				this.titleService.setTitle(this.themeTitleAr);
				this.loadStyle('ar-css.css');
				this.loadStyle(`${this.themeName}-ar-css.css`, 'custom-theme');
			} else if (!this.themeName && this.isArabic) {
				this.titleService.setTitle('مجلسى - للاجتماعات الذكية');
				this.loadStyle('ar-css.css');
			} else {
				this.titleService.setTitle('Mjlsi - Smart Meetings');
				this.loadStyle('en-css.css');
			}
			// get themeName Configuration
		});
	}

	loadStyle(styleName: string, id: string = 'client-theme') {
		const head = this.document.getElementsByTagName('head')[0];
		const style = this.document.createElement('link');
		style.id = id;
		style.rel = 'stylesheet';
		style.href = `${styleName}`;
		head.appendChild(style);
	}

	ngAfterViewInit(): void {
		if (this.splashScreen) {
			this.splashScreenService.init(this.splashScreen.nativeElement);
		}

		const script = document.createElement('script');
		script.type = 'text/javascript';
		document.getElementsByTagName('head')[0].appendChild(script);
		script.src = 'https://maps.googleapis.com/maps/api/js?key=' + environment.googleMapKey + '&libraries=places';

	}


	getLanguage() {
		this.isArabic = this.translationService.isArabic();
	}

	listenToSystemNotificationChannel() {
		window.Echo.channel('systemNotification')
			.listen('.SystemNotificationEvent', (data) => {
				this._userService.getCurrentUser().subscribe(res => {
					let index = -1;
					if (res.user.meeting_guest_id != null) {
						this.meetingGuestId = res.user.meeting_guest_id;
						const notificationGuestsIds = data.data.notificationGuestsIds;
						index = notificationGuestsIds?.findIndex(voterId => voterId === this.meetingGuestId);
					} else {
						this.userId = res.user.id;
						const notificationUsersIds = data.data.notificationUsersIds;
						index = notificationUsersIds.findIndex(voterId => voterId === this.userId);
					}

					this.notificationService.setNotificationDataChanged(data.data);
					this.getNumberOfNewNotifications();
					if (index > -1) {
						this.notificationService.setIsNewNotification(true);
						const message = this.isArabic ? data.data.notificationMessageAr : data.data.notificationMessageEn;
						const title = this.isArabic ? data.data.notificationTitleAr : data.data.notificationTitleEn;
						const notificationUrl = data.data.notificationUrl;
						// if not in presentation page or in presentation page and notification is descision
						if (!this.isPresentation || (this.isPresentation && data.data.notificationModelType === NotificationModelTypes.meetingDecision)) {
							this.renderTostr(data.data, message, title, notificationUrl);
						}
					}
				});
			}, (e) => {
			});
	}

	getNumberOfNewNotifications() {
		this.notificationService.getNewNotificationCount().subscribe(res => {
			// set new notifications number
			this.notificationService.setCountOfNewNotifications(res.count);
		}, error => {
		});
	}

	markNotificationAsReaded(notification) {
		if (!notification.is_read) {
			this.notificationService.updateUnReadNotificationsToBeRead(notification.notificationId).subscribe(res => {
				this.getNumberOfNewNotifications();
			});
		}
	}

	getCurrentUser() {
		this.userObs = this._userService.getCurrentUser();
	}

	renderTostr(notification, message, title, notificationUrl) {
		const toastr = this.toastr.info(message, title, {
			timeOut: environment.toastTimeout,
			// position: 'bottom-left'
		});
		notification.toastr_id = toastr.toastId;
		toastr.onTap.subscribe((res) => {
			// if (notification.toastr_id === res.id) {
				this.markNotificationAsReaded(notification);
				if (notificationUrl) {
					this.router.navigate([notificationUrl]);
				}
			// }
		});
	}

	setLanguage() {
		switch (environment.companyName) {
			case 'mjlsi':
				this.translationService.loadTranslations(enLang, arLang, mjlsiEnLang, mjlsiArLang);
				break;
			case 'lijani':
				this.translationService.loadTranslations(enLang, arLang, lijaniEnLang, lijaniArLang);
				break;
			case 'swcc':
				this.translationService.loadTranslations(enLang, arLang, SWCCEnLang, SWCCArLang);
				break;
		}
	}
}
