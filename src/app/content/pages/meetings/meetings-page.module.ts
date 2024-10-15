import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeetingsPageComponent } from './meetings-page.component';
import { MeetingPageComponent } from './meeting/meeting-page.component';
import { MeetingListPageComponent } from './meeting-list/meeting-list-page.component';
import { MeetingsModule } from '../../components/meetings/meetings.module';
import { Right } from './../../../core/models/enums/rights';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { MOMPageComponent } from './mom/mom-page.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { PartialsModule } from '../../../content/partials/partials.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TasksManagementModule } from '../../components/tasks-management/tasks-management.module';
import { JoyrideModule } from 'ngx-joyride';
const routes: Routes = [
	{
		path: '',
		component: MeetingsPageComponent,
		children: [
			{
				path: '',
				component: MeetingListPageComponent,
				data: {
					right: Right.MEETINGS
				}
			},
			{
				path: 'add',
				component: MeetingPageComponent,
				data: {
					right: Right.ADDNEWMEETING
				}
			},
			{
				path: 'edit/:id',
				component: MeetingPageComponent,
				data: {
					right: Right.EDITMEETING
				}
			},
			{
				path: 'mom/:id',
				component: MOMPageComponent,
				data: {
					right: Right.MANAGEMOM
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		FormsModule,
		RouterModule.forChild(routes),
		NgbNavModule,
		MatTabsModule,
		NgbAccordionModule,
		MeetingsModule,
		TranslateModule,
		NgSelectModule,
		NgbModule,
		PartialsModule,
		TasksManagementModule,
		JoyrideModule
	],
	declarations: [
        MeetingsPageComponent, MeetingPageComponent, MeetingListPageComponent, MOMPageComponent
    ],
    providers: [],
})

export class MeetingsPageModule { }
