import { filter } from 'rxjs/operators';
import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { NavigationStart, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

interface LanguageFlag {
	lang: string;
	country: string;
	flag: string;
	active?: boolean;
}

@Component({
	selector: 'm-language-selector',
	templateUrl: './language-selector.component.html',
	styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
	// tslint:disable-next-line:max-line-length
	@HostBinding('class') classes = 'm-nav__item m-topbar__languages m-dropdown m-dropdown--small m-dropdown--arrow m-dropdown--align-right m-dropdown--mobile-full-width';
	@HostBinding('attr.m-dropdown-toggle') mDropdownToggle = 'click';

	vendorCSSUrl: string;
	baseStyleCSSUrl: string;
	layoutCSSUrl: string;

	language: LanguageFlag;
	languages: LanguageFlag[] = [
		{
			lang: 'en',
			country: 'English',
			flag: 'assets/app/media/img/flags/020-flag.svg'
		},
		// {
		// 	lang: 'ch',
		// 	country: 'China',
		// 	flag: 'assets/app/media/img/flags/015-china.svg'
		// },
		// {
		// 	lang: 'es',
		// 	country: 'Spain',
		// 	flag: 'assets/app/media/img/flags/016-spain.svg'
		// },
		// {
		// 	lang: 'jp',
		// 	country: 'Japan',
		// 	flag: 'assets/app/media/img/flags/014-japan.svg'
		// },
		// {
		// 	lang: 'de',
		// 	country: 'Germany',
		// 	flag: 'assets/app/media/img/flags/017-germany.svg'
		// },
		// {
		// 	lang: 'fr',
		// 	country: 'France',
		// 	flag: 'assets/app/media/img/flags/019-france.svg'
		// },
		{
			lang: 'ar',
			country: 'العربية',
			flag: './assets/app/media/img/flags/008-saudi-arabia.svg'
		},
	];

	constructor(
		private translationService: TranslationService,
		private router: Router,
		private el: ElementRef,
		private sanitizer: DomSanitizer,
	) { }

	ngOnInit() {
		this.setSelectedLanguage();
		this.router.events
			.pipe(filter(event => event instanceof NavigationStart))
			.subscribe(event => {
				this.setSelectedLanguage();
			});
	}

	setLanguage(lang) {
		this.translationService.setLanguage(lang);
		// const isArabic = this.translationService.isArabic();
		// if (isArabic) {
		// 	require("style-loader!assets/vendors/base/vendors.bundle.rtl.css");
		// 	require("style-loader!assets/demo/default/base/style.bundle.rtl.css");
		// 	require("style-loader!assets/demo/default/base/layout.rtl.css");
		// }
		// else{
		// 	require("style-loader!assets/vendors/base/vendors.bundle.css");
		// 	require("style-loader!assets/demo/default/base/style.bundle.css");
		// 	require("style-loader!assets/demo/default/base/layout.css");
		// }

		// this.router.onSameUrlNavigation = 'reload';
		// this.router.navigateByUrl(this.router.url);
		// this.redirectTo(this.router.url);
		window.location.reload();
	}

	setSelectedLanguage(): any {
		const lang = this.translationService.getSelectedLanguage()
		if (lang) {
			setTimeout(() => {
				this.languages.forEach((language: LanguageFlag) => {
					if (language.lang === lang) {
						language.active = true;
						this.language = language;
					} else {
						language.active = false;
					}
				});
				(<DOMTokenList>this.el.nativeElement.classList).remove('m-dropdown--open');
			});
		}
	}

	redirectTo(uri: string) {
		this.router.navigateByUrl(uri).then(() =>
			this.router.navigate([uri]));
	}
}
