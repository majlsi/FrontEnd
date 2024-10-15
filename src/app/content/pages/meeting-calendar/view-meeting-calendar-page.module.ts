
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ViewMeetingsCalendarPageComponent } from './view-meetings-calendar/view-meetings-calendar-page.component';
import { ViewMeetingsModule } from '../../components/view-meetings/view-meetings.module';
import { Right } from '../../../core/models/enums/rights';
import { ViewMeetingCalendarPageComponent } from './view-meeting-calendar-page.component';



const routes: Routes = [
	{
		path: '',
		component: ViewMeetingCalendarPageComponent,
		children: [

			{
				path: '',
				component: ViewMeetingsCalendarPageComponent,
				data: {
					// right: Right.MEETINGTYPESLIST
				},
			}/* ,
			{
				path: ':id',
				component: ViewMeetingPageComponent,
				data: {
					// right:  Right.ADDNEWMEETINGTYPE
				}
			} */
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
		ViewMeetingCalendarPageComponent, ViewMeetingsCalendarPageComponent
	],

    providers: []
})

export class ViewMeetingCalendarPageModule { }
