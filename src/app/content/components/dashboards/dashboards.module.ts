import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PartialsModule } from '../../../content/partials/partials.module';
import { ParticipantDashboardComponent } from './participant-dashboard/participant-dashboard.component';
import { MjlsiAdminDashboardComponent } from './mjlsi-admin-dashboard/mjlsi-admin-dashboard.component';
import { SecertaryDashboardComponent } from './secertary-dashboard/secertary-dashboard.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommitteeDashboardComponent } from './committee-dashboard/committee-dashboard.component';
import { DashboardDecisionComponent } from './dashboard-decision/dashboard-decision.component';
import { DashboardReviewsComponent } from './dashboard-reviews/dashboard-reviews.component';
import { DashboardTasksComponent } from './dashboard-tasks/dashboard-tasks.component';
import { DashboardMeetingsComponent } from './dashboard-meetings/dashboard-meetings.component';
import { DashboardMembersComponent } from './dashboard-members/dashboard-members.component';
import { DashboardCommitiesComponent } from './dashboard-commities/dashboard-commities.component';
import { DashboardCircularDecisionsComponent } from './dashboard-circular-decisions/dashboard-circular-decisions.component';
import { MemberCommitiesComponent } from './member-commities/member-commities.component';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TasksManagementModule } from '../tasks-management/tasks-management.module';
import { CommitteesControlPanelComponent } from './committees-control-panel/committees-control-panel.component';
import { SharedModule } from '../shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { DaysPassedStatisticsComponent } from './days-passed-statistics/days-passed-statistics.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommitteeRemainPercentageComponent } from './committee-remain-percentage/committee-remain-percentage.component';
import { MostMemberParticipateComponent } from './most-member-participate/most-member-participate.component';
import { NumberOfCommitteesPerDecisionResponsibleComponent } from './number-of-committees-per-decision-responsible/number-of-committees-per-decision-responsible.component';


@NgModule({
  imports: [
	CommonModule,
	PartialsModule,
	RouterModule,
	TranslateModule,
	NgxChartsModule,
	FullCalendarModule,
    NgbModule,
    NgbNavModule,
    MatTooltipModule,
    RouterModule,
	TasksManagementModule,
	SharedModule,
	MatTableModule,
	MatPaginatorModule,
	MatSortModule,
	MatProgressSpinnerModule
  ],
  declarations: [
	  ParticipantDashboardComponent,
	  MjlsiAdminDashboardComponent,
	  SecertaryDashboardComponent,
	  CommitteeDashboardComponent,
	  DashboardDecisionComponent,
	  DashboardReviewsComponent,
	  DashboardTasksComponent,
	  DashboardMeetingsComponent,
	  DashboardMembersComponent,
	  DashboardCommitiesComponent,
	  DashboardCircularDecisionsComponent,
	  MemberCommitiesComponent,
   CommitteesControlPanelComponent,
   DaysPassedStatisticsComponent,
   CommitteeRemainPercentageComponent,
   MostMemberParticipateComponent,
   NumberOfCommitteesPerDecisionResponsibleComponent
	],
  exports: [
	  ParticipantDashboardComponent,
	  MjlsiAdminDashboardComponent,
	  SecertaryDashboardComponent,
	  CommitteeDashboardComponent,
	  DashboardDecisionComponent,
	  DashboardReviewsComponent,
	  DashboardTasksComponent,
	  DashboardMeetingsComponent,
	  DashboardMembersComponent,
	  DashboardCommitiesComponent,
	  DashboardCircularDecisionsComponent,
	  MemberCommitiesComponent,
	  CommitteesControlPanelComponent,
	  DaysPassedStatisticsComponent,
	  CommitteeRemainPercentageComponent,
	  MostMemberParticipateComponent,
	  NumberOfCommitteesPerDecisionResponsibleComponent,
	],
})
export class DashboardsModule { }
