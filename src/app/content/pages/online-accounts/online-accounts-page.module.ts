import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OnlineAccountsPageComponent } from './online-accounts-page.component';
import { OnlineAccountPageComponent } from './online-account/online-account-page.component';
import { OnlineAccountListPageComponent } from './online-account-list/online-account-list-page.component';
import { OnlineAccountsModule } from '../../components/online-accounts/online-accounts.module';
import { Right } from './../../../core/models/enums/rights';

const routes: Routes = [
	{
		path: '',
		component: OnlineAccountsPageComponent,
		children: [
			{
				path: '',
				component: OnlineAccountListPageComponent,
				data: {
					right: Right.LIST_ONLINE_ACCOUNTS
				}
			},
			{
				path: 'add',
				component: OnlineAccountPageComponent,
				data: {
					right: Right.ADD_ONLINE_ACCOUNTS
				}
			},
			{
				path: ':id',
				component: OnlineAccountPageComponent,
				data: {
					right: Right.EDIT_ONLINE_ACCOUNTS
				}
			}

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		OnlineAccountsModule

	],
	declarations: [
        OnlineAccountsPageComponent, OnlineAccountPageComponent, OnlineAccountListPageComponent
    ],
    providers: [],
})

export class OnlineAccountsPageModule { }
