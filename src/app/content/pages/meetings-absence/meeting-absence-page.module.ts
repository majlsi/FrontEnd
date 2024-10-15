import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MeetingAbsencePageComponent } from './meeting-absence-page.component';
import { MeetingAbsenceListPageComponent } from './meeting-absence-list/meeting-absence-list-page.component';
import { MeetingAbsenceModule } from '../../components/meeting-absence/meeting-absence.module';
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
		component: MeetingAbsencePageComponent,
		children: [
			{
				path: '',
				component: MeetingAbsenceListPageComponent,
				data: {
					right: Right.MANAGEABSENCE
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
		MeetingAbsenceModule,
		TranslateModule,
		NgbCollapseModule,
		FormsModule,
		NgSelectModule,
		DlDateTimeDateModule,
		PartialsModule
	],
	declarations: [
        MeetingAbsencePageComponent, MeetingAbsenceListPageComponent
    ],
    providers: [],
})

export class MeetingAbsencePageModule { }
