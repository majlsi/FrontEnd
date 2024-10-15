import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PreviewMeetingComponent } from './preview-meeting/preview-meeting.component';
import { PartialsModule } from '../../../content/partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NgbAccordionModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CountdownModule } from 'ngx-countdown';
import { CdTimerModule } from 'angular-cd-timer';
import { MeetingsModule } from '../../components/meetings/meetings.module';
import { ChatsModule } from '../chats/chats.module';

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
		// BrowserModule,
		FullCalendarModule,
		NgbNavModule,
		MatTabsModule,
		CountdownModule,
		CdTimerModule,
		MeetingsModule,
		ChatsModule
	],
	declarations: [
		PreviewMeetingComponent

	],
	exports: [PreviewMeetingComponent,
	],
	providers: []
})

export class PreviewMeetingsModule { }
