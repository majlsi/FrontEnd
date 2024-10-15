
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MeetingTypesPageComponent } from './meeting-types-page.component';
import { MeetingTypeListPageComponent } from './meeting-type-list/meeting-type-list-page.component';
import { MeetingTypePageComponent } from './meeting-type/meeting-type-page.component';
import { MeetingTypesModule } from '../../components/meeting-types/meeting-types.module';
import { Right } from './../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: MeetingTypesPageComponent,
		children: [

			{
				path: '',
				component: MeetingTypeListPageComponent,
				data: {
					right: Right.MEETINGTYPESLIST
				},
			},
			{
				path: 'add',
				component: MeetingTypePageComponent,
				data: {
					right:  Right.ADDNEWMEETINGTYPE
				}
			},
			{
				path: 'edit/:id',
				component: MeetingTypePageComponent,
				data: {
					right: Right.EDITMEETINGTYPE
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		MeetingTypesModule
	],
	declarations: [
		MeetingTypesPageComponent, MeetingTypeListPageComponent, MeetingTypePageComponent
	],

    providers: []
})

export class MeetingTypesPageModule { }
