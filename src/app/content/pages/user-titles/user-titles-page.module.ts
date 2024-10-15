
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserTitlesPageComponent } from './user-titles-page.component';
import { UserTitleListPageComponent } from './user-title-list/user-title-list-page.component';
import { UserTitlePageComponent } from './user-title/user-title-page.component';
import { UserTitlesModule } from '../../components/user-titles/user-titles.module';
import { Right } from '../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: UserTitlesPageComponent,
		children: [

			{
				path: '',
				component: UserTitleListPageComponent,
				data: {
					right: Right.USERTITLESLIST
				},
			},
			{
				path: 'add',
				component: UserTitlePageComponent,
				data: {
					right:  Right.ADDNEWUSERTITLE
				}
			},
			{
				path: 'edit/:id',
				component: UserTitlePageComponent,
				data: {
					right: Right.EDITUSERTITLE
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		UserTitlesModule
	],
	declarations: [
		UserTitlesPageComponent, UserTitleListPageComponent, UserTitlePageComponent
	],

    providers: []
})

export class UserTitlesPageModule { }
