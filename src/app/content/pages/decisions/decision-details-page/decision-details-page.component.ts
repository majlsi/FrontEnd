import { Component, OnInit } from '@angular/core';

import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-decision-details-page',
  templateUrl: './decision-details-page.component.html',
  styleUrls: ['./decision-details-page.component.scss']
})
export class DecisionDetailsPageComponent implements OnInit {
	isArabic: boolean = false;
	lang: string;

  constructor(
	private router: Router,
	private translate: TranslateService,
	private translationService: TranslationService,
	private location: Location) { }

  ngOnInit() {
  }
	getLanguage() {
		this.isArabic = this.translationService.isArabic();
		if (this.isArabic === true) {
			this.lang = 'ar';
		} else {
			this.lang = 'en';
		}
	}
  back() {
	this.location.back();
}

}
