
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TimeZonesPageComponent } from './time-zones-page.component';
import { TimeZoneListPageComponent } from './time-zone-list/time-zone-list-page.component';
import { TimeZonePageComponent } from './time-zone/time-zone-page.component';
import { TimeZonesModule } from '../../components/time-zones/time-zones.module';
import { Right } from './../../../core/models/enums/rights';



const routes: Routes = [
	{
		path: '',
		component: TimeZonesPageComponent,
		children: [

			{
				path: '',
				component: TimeZoneListPageComponent,
				data: {
					right: Right.TIMEZONESLIST
				},
			},
			{
				path: 'add',
				component: TimeZonePageComponent,
				data: {
					right:  Right.ADDTIMEZONES
				}
			},
			{
				path: 'edit/:id',
				component: TimeZonePageComponent,
				data: {
					right: Right.EDITTIMEZONES
				}
			},

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		TimeZonesModule
	],
	declarations: [
		TimeZonesPageComponent, TimeZoneListPageComponent, TimeZonePageComponent
	],

    providers: []
})

export class TimeZonesPageModule { }
