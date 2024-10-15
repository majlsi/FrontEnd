import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { PartialsModule } from "../../partials/partials.module";
import { FullCalendarModule } from '@fullcalendar/angular';
import { TranslateModule } from "@ngx-translate/core";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { PresentationComponent } from "./presentation/presentation.component";
import { FormsModule } from "@angular/forms";
import { NgbCollapseModule } from "@ng-bootstrap/ng-bootstrap";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { ChangePresenterComponent } from "./change-presenter/change-presenter.component";
import { VoteResultsComponent } from "./vote-results/vote-results.component";
import { AddVoteComponent } from "./presentation/add-vote/add-vote.component";
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { NgSelectModule } from "@ng-select/ng-select";
import { MeetingInfoAsideComponent } from "./presentation/meeting-info-aside/meeting-info-aside.component";
import { AgendaVotesCommentsAsideComponent } from "./presentation/agenda-votes-comments-aside/agenda-votes-comments-aside.component";
import { CountdownModule } from "ngx-countdown";
import { CdTimerModule } from "angular-cd-timer";
import { ChatsModule } from "../chats/chats.module";
import { DecisionsModule } from "../decisions/decisions.module";
@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		RouterModule,
		TranslateModule,
		NgxChartsModule,
		FullCalendarModule,
		FormsModule,
		NgbModule,
		NgbCollapseModule,
		MatTableModule,
		MatIconModule,
		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatSortModule,
		MatRadioModule,
		MatTooltipModule,
		CountdownModule,
		CdTimerModule,
		NgSelectModule,
		ChatsModule,
		DecisionsModule
	],
	declarations: [
		PresentationComponent,
		ChangePresenterComponent,
		MeetingInfoAsideComponent,
		AgendaVotesCommentsAsideComponent,
		VoteResultsComponent,
		AddVoteComponent,
	],
	exports: [
		PresentationComponent,
		ChangePresenterComponent,
		VoteResultsComponent,
	],
})
export class AttachmentPresentationModule {}
