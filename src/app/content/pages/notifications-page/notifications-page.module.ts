
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Right } from './../../../core/models/enums/rights';
import { NotificationsPageComponent } from './notifications-page.component';
import { NotificationsPageListComponent } from './notifications-page-list/notifications-page-list.component';
import { NotificationsModule } from '../../components/notifications/notifications.module';
const routes: Routes = [
	{
		path: '',
		component: NotificationsPageComponent,
		children: [
			{
				path: '',
				component: NotificationsPageListComponent,

			}

		]
	}
];


@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		NotificationsModule

	],
  declarations: [NotificationsPageComponent, NotificationsPageListComponent]
})

export class NotificationsPageModule { }

