import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MeetingAbsenceListComponent } from './meeting-absence-list/meeting-absence-list.component';
import { PartialsModule } from '../../partials/partials.module';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';


import { TranslateModule } from '@ngx-translate/core';


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
		MatCheckboxModule,
		TranslateModule,
		CustomFormsModule,

	],
	declarations: [
		MeetingAbsenceListComponent,
	],
	exports: [
		MeetingAbsenceListComponent,
	],
    providers: [

	],
})

export class MeetingAbsenceModule { }
