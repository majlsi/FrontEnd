
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PreviewMeetingsPageComponent } from './preview-meetings-page.component';
import { PreviewMeetingPageComponent } from './preview-meeting/preview-meeting-page.component';
import { PreviewMeetingsModule } from '../../components/preview-meetings/preview-meetings.module';
import { Right } from './../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: PreviewMeetingsPageComponent,
		children: [
			{
				path: ':id',
				component: PreviewMeetingPageComponent,
				data: {
				}
			}
		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		PreviewMeetingsModule,
	],
	declarations: [
		PreviewMeetingsPageComponent, PreviewMeetingPageComponent
	],

    providers: []
})

export class PreViewMeetingsPageModule { }
