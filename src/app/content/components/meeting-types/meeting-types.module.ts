import { NgModule } from '@angular/core';
import {  RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MeetingTypeComponent } from './meeting-type/meeting-type.component';
import { MeetingTypeListComponent } from './meeting-type-list/meeting-type-list.component';
import { PartialsModule } from '../../../content/partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { NgbAccordionModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

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
		TranslateModule
	],
	declarations: [
        MeetingTypeComponent, MeetingTypeListComponent
	],
	exports: [MeetingTypeComponent, MeetingTypeListComponent],

    providers: []
})

export class MeetingTypesModule { }
