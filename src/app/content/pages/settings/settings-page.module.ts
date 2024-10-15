import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SettingsPageComponent } from './settings-page.component';
import { SettingPageComponent } from './setting/setting-page.component';
import { SettingsModule } from '../../components/settings/settings.module';
import { Right } from '../../../core/models/enums/rights';

const routes: Routes = [
	{
		path: '',
		component:  SettingPageComponent,
		children: [
			{
				path: '',
				component:  SettingsPageComponent,
				data: {
					right: Right.SETTINGSADMIN
				}
			}

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		SettingsModule
	],
	declarations: [
        SettingsPageComponent ,  SettingPageComponent
    ],
    providers: []
})

export class SettingsPageModule { }
