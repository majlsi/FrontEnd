
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GuideVideosPageComponent } from './guide-videos-page.component';
import { GuideVideoListPageComponent } from './guide-video-list/guide-video-list-page.component';
import { GuideVideoPageComponent } from './guide-video/guide-video-page.component';
import { GuideVideosModule } from '../../components/guide-videos/guide-videos.module';
import { Right } from '../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: GuideVideosPageComponent,
		children: [

			{
				path: '',
				component: GuideVideoListPageComponent,
				data: {
					right: Right.VIDEOS_GUIDE_LIST
				},
			},
			{
				path: 'add',
				component: GuideVideoPageComponent,
				data: {
					right:  Right.ADD_VIDEO_GUIDE
				}
			},
			{
				path: 'edit/:id',
				component: GuideVideoPageComponent,
				data: {
					right: Right.EDIT_VIDEO_GUIDE
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		GuideVideosModule
	],
	declarations: [
		GuideVideosPageComponent, GuideVideoListPageComponent, GuideVideoPageComponent
	],

    providers: []
})

export class GuideVideosPageModule { }
