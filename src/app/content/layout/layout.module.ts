import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { AsideLeftComponent } from './aside/aside-left.component';
import { FooterComponent } from './footer/footer.component';
import { BrandComponent } from './header/brand/brand.component';
import { MenuSectionComponent } from './aside/menu-section/menu-section.component';
import { TopbarComponent } from './header/topbar/topbar.component';
import { CoreModule } from '../../core/core.module';
import { UserProfileComponent } from './header/topbar/user-profile/user-profile.component';

import { UserSignoutComponent } from './header/topbar/user-signout/user-signout.component';

import { MenuHorizontalComponent } from './header/menu-horizontal/menu-horizontal.component';
import { LanguageSelectorComponent } from './header/topbar/language-selector/language-selector.component';

import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';

import { TranslateModule } from '@ngx-translate/core';
import { LoadingBarModule } from '@ngx-loading-bar/core';
import { FormsModule } from '@angular/forms';
import { NotificationComponent } from './header/notification/notification.component';
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	// suppressScrollX: true
};

@NgModule({
	declarations: [
		HeaderComponent,
		FooterComponent,
		BrandComponent,

		// topbar components
		TopbarComponent,
		UserProfileComponent,
		UserSignoutComponent,
		LanguageSelectorComponent,

		// aside left menu components
		AsideLeftComponent,
		MenuSectionComponent,

		// horizontal menu components
		MenuHorizontalComponent,
		NotificationComponent
	],
	exports: [
		HeaderComponent,
		FooterComponent,
		BrandComponent,

		// topbar components
		TopbarComponent,
		UserProfileComponent,
		UserSignoutComponent,
		LanguageSelectorComponent,
		NotificationComponent,
		// aside left menu components
		AsideLeftComponent,
		// MenuSectionComponent,

		// horizontal menu components
		MenuHorizontalComponent,

	],
	providers: [
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
		}
	],
	imports: [
		CommonModule,
		RouterModule,
		CoreModule,
		PerfectScrollbarModule,
		NgbModule,
		FormsModule,
		MatProgressBarModule,
		MatTabsModule,
		MatButtonModule,
		TranslateModule.forChild(),
		LoadingBarModule,
	]
})
export class LayoutModule { }
