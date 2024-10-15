import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpCenterPageComponent } from './help-center-page.component';
import { VideosGuidePageComponent } from './videos-guide/videos-guide-page.component';
import { FaqsPageComponent } from './faqs/faqs-page.component';
import { Routes, RouterModule } from '@angular/router';
import { Right } from '../../../core/models/enums/rights';
import { HelpCenterModule } from '../../components/help-center/help-center.module';

const routes: Routes = [
	{
		path: '',
		component: HelpCenterPageComponent,
		children: [

			{
				path: 'tutorials',
				component: VideosGuidePageComponent,
				data: {
					right: Right.VIDEO_GUIDE_HELP
				},
			},
			{
				path: 'faqs',
				component: FaqsPageComponent,
				data: {
					right: Right.FAQ_TREE
				},
			},


		]
	}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
	HelpCenterModule
  ],
  declarations: [HelpCenterPageComponent, VideosGuidePageComponent, FaqsPageComponent]
})
export class HelpCenterPageModule { }
