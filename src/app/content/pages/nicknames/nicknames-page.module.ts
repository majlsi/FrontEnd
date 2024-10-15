
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NicknamesPageComponent } from './nicknames-page.component';
import { NicknameListPageComponent } from './nickname-list/nickname-list-page.component';
import { NicknamePageComponent } from './nickname/nickname-page.component';
import { NicknamesModule } from '../../components/nicknames/nicknames.module';
import { Right } from '../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: NicknamesPageComponent,
		children: [

			{
				path: '',
				component: NicknameListPageComponent,
				data: {
					right: Right.NICKNAMESLIST
				},
			},
			{
				path: 'add',
				component: NicknamePageComponent,
				data: {
					right:  Right.ADDNEWNICKNAME
				}
			},
			{
				path: 'edit/:id',
				component: NicknamePageComponent,
				data: {
					right: Right.EDITNICKNAME
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		NicknamesModule
	],
	declarations: [
		NicknamesPageComponent, NicknameListPageComponent, NicknamePageComponent
	],

    providers: []
})

export class NicknamesPageModule { }
