import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AttachmentPresentationModule } from '../../components/attachment-presentation/attachment-presentation.module';
import { Right } from './../../../core/models/enums/rights';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AttachmentPresentationPageComponent } from './attachment-presentation-page.component';

import { MasterPresentationPageComponent } from './presentation/master-presentation/master-presentation-page.component';

const routes: Routes = [
	{
		path: '',
		component: AttachmentPresentationPageComponent,
		children: [

			{
				path: '',
				component: MasterPresentationPageComponent,
				data: {
					isPresentation: true
				},
				
			}

		]
	}
];



@NgModule({
  imports: [
	CommonModule,
	RouterModule.forChild(routes),
	AttachmentPresentationModule,
	TranslateModule,
	NgxChartsModule
  ],
  declarations: [
	AttachmentPresentationPageComponent,
	MasterPresentationPageComponent
	],
    providers: [],
})
export class AttachmentPresentationPageModule { }

