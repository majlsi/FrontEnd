import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MeetingDashboardPageComponent } from './meeting-dashboard-page.component';
import { MeetingDashboardListPageComponent } from './meeting-list/meeting-dashboard-list-page.component';
import { MeetingsDashboardModule } from '../../components/meetings-dashboard/meetings-dashboard.module';
import { Right } from './../../../core/models/enums/rights';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslateModule } from '@ngx-translate/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DlDateTimeDateModule } from 'angular-bootstrap-datetimepicker';
import { PartialsModule } from '../../../content/partials/partials.module';
const routes: Routes = [
	{
		path: '',
		component: MeetingDashboardPageComponent,
		children: [
			{
				path: '',
				component: MeetingDashboardListPageComponent,
				data: {
					right: Right.MEETINGSDashBOARD
				}
			}

		]
	}
];


@NgModule({
    imports: [
		CommonModule,
		RouterModule.forChild(routes),
		NgbNavModule,
		MatTabsModule,
		NgbModule,
		NgbAccordionModule,
		MeetingsDashboardModule,
		TranslateModule,
		NgbCollapseModule,
		FormsModule,
		NgSelectModule,
		DlDateTimeDateModule,
		PartialsModule
	],
	declarations: [
        MeetingDashboardPageComponent, MeetingDashboardListPageComponent
    ],
    providers: [],
})

export class MeetingDashboardPageModule { }
