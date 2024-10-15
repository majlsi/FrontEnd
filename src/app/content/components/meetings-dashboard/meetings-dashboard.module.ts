import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MeetingDashboardListComponent } from './meetings-dashboard-list/meeting-dashboard-list.component';
import { PartialsModule } from '../../../content/partials/partials.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

import { TranslateModule } from '@ngx-translate/core';
import { DlDateTimeDateModule } from 'angular-bootstrap-datetimepicker';

/* Import Dropzone */
import { DropzoneModule, DropzoneConfigInterface, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { dropzone } from '../../../core/config/dropzone';
import { CustomFormsModule } from 'ngx-custom-validators';

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
		NgSelectModule,
		NgbModule,
		NgbCollapseModule,
		NgbNavModule,
		MatTabsModule,
		MatTooltipModule,
		MatCheckboxModule,
		TranslateModule,
		DlDateTimeDateModule,
		DropzoneModule,
		CustomFormsModule,
	],
	declarations: [
		MeetingDashboardListComponent,
	],
	exports: [
		MeetingDashboardListComponent,
	],
    providers: [
		{
			provide: DROPZONE_CONFIG,
			useValue: dropzone
		}
	],
})

export class MeetingsDashboardModule { }
