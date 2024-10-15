import { Component, OnInit, HostBinding, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LayoutConfigService } from '../../../core/services/layout-config.service';
import * as objectPath from 'object-path';
import { environment } from '../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-footer',
	templateUrl: './footer.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class FooterComponent implements OnInit {
	@HostBinding('class') classes = 'm-grid__item m-footer';

	footerContainerClass$: BehaviorSubject<string> = new BehaviorSubject('');

	footerTextOrgName: string;
	footerTextYear: string;

	constructor(private configService: LayoutConfigService, private translate: TranslateService) {
		this.configService.onLayoutConfigUpdated$.subscribe(model => {
			const config = model.config;

			let pageBodyClass = '';
			const selfLayout = objectPath.get(config, 'self.layout');
			if (selfLayout === 'boxed' || selfLayout === 'wide') {
				pageBodyClass += 'm-container--responsive m-container--xxl';
			} else {
				pageBodyClass += 'm-container--fluid';
			}
			this.footerContainerClass$.next(pageBodyClass);
		});
	}

	ngOnInit(): void {
		this.footerTextOrgName = "Mjlsi System";
		this.footerTextYear = (new Date()).getFullYear().toString();
		this.footerTextOrgName = this.translate.instant('COMPANY_NAME');
	}
}
