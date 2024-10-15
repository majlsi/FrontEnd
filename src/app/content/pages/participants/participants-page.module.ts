import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ParticipantsPageComponent } from './participants-page.component';
import { ParticipantPageComponent } from './participant/participant-page.component';
import { ParticipantListPageComponent } from './participant-list/participant-list-page.component';
import { UsersModule } from '../../components/users/users.module';
import { Right } from '../../../core/models/enums/rights';

const routes: Routes = [
	{
		path: '',
		component: ParticipantsPageComponent,
		children: [
			{
				path: '',
				component: ParticipantListPageComponent,
				data: {
					right: Right.PARTICIPANTS
				}
			},
			{
				path: 'add',
				component: ParticipantPageComponent,
				data: {
					right: Right.ADDPARTICIPANT
				}
			},
			{
				path: 'edit/:id',
				component: ParticipantPageComponent,
				data: {
					right: Right.EDITPARTICIPANT
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		UsersModule

	],
	declarations: [
        ParticipantsPageComponent, ParticipantPageComponent, ParticipantListPageComponent
    ],
    providers: [],
})

export class ParticipantsPageModule { }
