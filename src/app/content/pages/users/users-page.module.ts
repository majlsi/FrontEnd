import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsersPageComponent } from './users-page.component';
import { UserPageComponent } from './user/user-page.component';
import { UserListPageComponent } from './user-list/user-list-page.component';
import { UsersModule } from '../../components/users/users.module';
import { Right } from './../../../core/models/enums/rights';

const routes: Routes = [
	{
		path: '',
		component: UsersPageComponent,
		children: [
			{
				path: '',
				component: UserListPageComponent,
				data: {
					right: Right.USERSLIST
				}
			},
			{
				path: 'add',
				component: UserPageComponent,
				data: {
					right: Right.USERSADD
				}
			},
			{
				path: 'edit/:id',
				component: UserPageComponent,
				data: {
					right: Right.USERSEDIT
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
        UsersPageComponent, UserPageComponent, UserListPageComponent
    ],
    providers: [],
})

export class UsersPageModule { }
