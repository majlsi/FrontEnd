import { NgModule } from '@angular/core';
import {  RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CircularDecisionListComponent } from './circular-decision-list/circular-decision-list.component';
import { PartialsModule } from '../../../content/partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbAccordionModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule , NgbDatepickerModule} from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CircularDecisionComponent } from './circular-decision/circular-decision.component';
import { CoreModule } from '../../../core/core.module';
import { DropzoneModule, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { dropzone } from '../../../core/config/dropzone';
import { CirculatDecisionDetailsComponent } from './circular-decision-details/circular-decision-details.component';
import { CirculatDecisionTasksComponent } from './circular-decision-tasks/circular-decision-tasks.component';
import { TasksManagementModule } from '../tasks-management/tasks-management.module';
import { SharedModule } from '../shared/shared.module';
import { MeetingMinutesModule} from '../meeting-minutes/meeting-minutes.module';
import { JoyrideModule } from 'ngx-joyride';

@NgModule({
    imports: [
		CommonModule,
		PartialsModule,
		RouterModule,
		MatTableModule,
		MatIconModule,
		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatSortModule,
		FormsModule,
		NgbAccordionModule,
		NgbCollapseModule,
        TranslateModule,
        NgSelectModule,
		MatTooltipModule,
		CoreModule,
		NgbDatepickerModule,
		NgbModule,
		DropzoneModule,
		TasksManagementModule,
		SharedModule,
		MeetingMinutesModule,
		JoyrideModule
	],
	declarations: [
        CircularDecisionListComponent, CircularDecisionComponent, CirculatDecisionDetailsComponent,
		CirculatDecisionTasksComponent
	],
	exports: [CircularDecisionListComponent, CircularDecisionComponent, CirculatDecisionDetailsComponent, CirculatDecisionTasksComponent],

    providers: [
		{
			provide: DROPZONE_CONFIG,
			useValue: dropzone
		}
	],
})

export class CircularDecisionsModule { }
