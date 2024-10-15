import { Inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

export interface Locale {
	lang: string;
	data: Object;
}

@Injectable({
	providedIn: 'root'
})
export class TranslationService {
	private langIds: any = [];
	private selectedLanguage: string;

	constructor(private translate: TranslateService, @Inject(DOCUMENT) private _document: any) {
		// add new langIds to the list
		this.translate.addLangs(['ar']);
		// this language will be used as a fallback when a translation isn't found in the current language
		if (localStorage.getItem('language')) {
			this.translate.setDefaultLang(localStorage.getItem('language'));
		} else {
			this.setLanguage('ar');
			this.translate.setDefaultLang('ar');
		}

	}

	public loadTranslations(...args: Locale[]): void {
		const locales = [...args];

		locales.forEach(locale => {
			// use setTranslation() with the third argument set to true
			// to append translations instead of replacing them
			this.translate.setTranslation(locale.lang, locale.data, true);

			this.langIds.push(locale.lang);
		});

		// add new languages to the list
		this.translate.addLangs(this.langIds);
	}

	setLanguage(lang) {
		if (lang) {
			// this.translate.use(this.translate.getDefaultLang());
			// this.translate.use(lang);
			localStorage.setItem('language', lang);
			this._document.documentElement.lang = lang;
		}
	}

	public getSelectedLanguage(): string {
		return localStorage.getItem('language') || this.translate.getDefaultLang();
	}
	public isArabic(): boolean {
		this.selectedLanguage = this.getSelectedLanguage();
		if (this.selectedLanguage === 'ar') {
			return true;
		} else {
			return false;
		}
	}

	setAppLanguage(lang){
		this.translate.setDefaultLang(lang);
		this._document.documentElement.lang = lang;
	}
}
