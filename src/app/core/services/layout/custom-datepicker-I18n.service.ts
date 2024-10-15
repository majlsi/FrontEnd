import { TranslationWidth } from '@angular/common';
import { Injectable } from '@angular/core';
import { NgbDatepickerI18n, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

let lang = localStorage.getItem('language');

if (!lang) {
	lang = 'ar';
}
moment.locale(lang);
const arDow = [ 2, 3, 4, 5, 6,0,1];
const enDow = [1, 2, 3, 4, 5, 6,0];
const weekDays = lang == 'ar'? arDow.map(dow => moment().weekday(dow).format('dd')) : enDow.map(dow => moment().weekday(dow).format('dd'));
const I18N_VALUES = {
	weekdays: weekDays,
	months: moment.monthsShort(),
	// other languages you would support
};

@Injectable()
export class CustomDatepickerI18nService extends NgbDatepickerI18n {
	
	constructor() {
		super();
	}
	 
	getWeekdayLabel(weekday: number, width?: TranslationWidth): string {
		return I18N_VALUES.weekdays[weekday - 1];
	}

	getMonthShortName(month: number): string {
		return I18N_VALUES.months[month - 1];
	}
	getMonthFullName(month: number): string {
		return this.getMonthShortName(month);
	}

	getDayAriaLabel(date: NgbDateStruct): string {
		return `${date.day}-${date.month}-${date.year}`;
	}

}
