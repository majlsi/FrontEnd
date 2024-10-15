
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ViewMeetingsPageComponent } from './view-meetings-page.component';
import { ViewMeetingPageComponent } from './view-meeting/view-meeting-page.component';
import { ViewMeetingsModule } from '../../components/view-meetings/view-meetings.module';
import { Right } from './../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: ViewMeetingsPageComponent,
		children: [

			/* {
				path: 'calendar',
				component: ViewMeetingsCalendarPageComponent,
				data: {
					// right: Right.MEETINGTYPESLIST
				},
			}, */
			{
				path: ':id',
				component: ViewMeetingPageComponent,
				data: {
					 right:  Right.VIEWMEETING
				}
			}
		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		ViewMeetingsModule,
	],
	declarations: [
		ViewMeetingsPageComponent, ViewMeetingPageComponent
	],

    providers: []
})

export class ViewMeetingsPageModule { }
