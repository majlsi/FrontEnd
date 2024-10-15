import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlockedUsersModule } from '../../components/blocked-users/blocked-users.module';
import { Right } from '../../../core/models/enums/rights';
import { BolckedUsersPageComponent } from './blocked-users-page.component';
import { BlockedUsersListPageComponent } from './blocked-users-list/blocked-users-list-page.component';

const routes: Routes = [
	{
		path: '',
		component:  BolckedUsersPageComponent,
		children: [
			{
				path: '',
				component:  BlockedUsersListPageComponent,
				data: {
					right: Right.BLOCKED_USERS
				}
			}

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		BlockedUsersModule
	],
	declarations: [
        BolckedUsersPageComponent, BlockedUsersListPageComponent
    ],
    providers: []
})

export class BlockedUsersPageModule { }
