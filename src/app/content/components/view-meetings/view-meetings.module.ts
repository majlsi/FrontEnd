import { ViewMeetingStatisticsComponent } from './view-meeting-statistics/view-meeting-statistics.component';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ViewMeetingComponent } from './view-meeting/view-meeting.component';
import { ViewMeetingsCalendarComponent } from './view-meetings-calendar/view-meetings-calendar.component';
import { PartialsModule } from '../../../content/partials/partials.module';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { NgbAccordionModule, NgbNavModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { sanitizeHtmlPipe } from '../../../core/pipes/sanitize-html.pipe';
import { RejectionReasonsComponent } from '../view-meetings/rejection-reasons/rejection-reasons.component';
import { CountdownModule } from 'ngx-countdown';
import { CdTimerModule } from 'angular-cd-timer';
import { MeetingsModule } from '../../components/meetings/meetings.module';
import { ChatsModule } from '../chats/chats.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AttachmentPresentationModule } from '../attachment-presentation/attachment-presentation.module';


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
		ChatsModule,
		NgbModule,
		NgxChartsModule,
		AttachmentPresentationModule
	],


	declarations: [
		ViewMeetingComponent, ViewMeetingsCalendarComponent, sanitizeHtmlPipe, RejectionReasonsComponent,ViewMeetingStatisticsComponent

	],
	exports: [ViewMeetingComponent, ViewMeetingsCalendarComponent, sanitizeHtmlPipe, RejectionReasonsComponent
	],
	providers: []
})

export class ViewMeetingsModule { }


