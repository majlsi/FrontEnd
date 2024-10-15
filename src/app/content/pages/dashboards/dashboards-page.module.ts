import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardsPageComponent } from './dashboards-page.component';
import { SecertaryDashboardPageComponent } from './secertary-dashboard/secertary-dashboard-page.component';
import { ParticipantDashboardPageComponent } from './participant-dashboard/participant-dashboard-page.component';
import { MjlsiAdminDashboardPageComponent } from './mjlsi-admin-dashboard/mjlsi-admin-dashboard-page.component';
import { DashboardsModule } from '../../components/dashboards/dashboards.module';
import { Right } from './../../../core/models/enums/rights';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommitteeDashboardPageComponent } from './committee-secretary-dashboard/committee-dashboard-page.component';
import { BoardSecretaryDashboardPageComponent } from './board-secretary-dashboard/board-secretary-dashboard-page.component';
import { MemberDashboardPageComponent } from './member-dashboard/member-dashboard-page.component';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { PartialsModule } from '../../partials/partials.module';
import { CommitteeControlPanelPageComponent } from './committee-control-panel-page/committee-control-panel-page.component';
import { DaysPassedStatisticsPageComponent } from './days-passed-statistics-page/days-passed-statistics-page.component';
import { CommitteeRemainPercentagePageComponent } from './committee-remain-percentage-page/committee-remain-percentage-page.component';
import { MostMemberParticipatePageComponent } from './most-member-participate-page/most-member-participate-page.component';
import { NumberOfCommitteesPerDecisionResponsiblePageComponent } from './number-of-committees-per-decision-responsible-page/number-of-committees-per-decision-responsible-page.component';

const routes: Routes = [
	{
		path: '',
		component: DashboardsPageComponent,
		children: [
			{
				path: 'secertary_dashboard',
				component: SecertaryDashboardPageComponent,
				data: {
					right: Right.SECERTARYDASHBOARD
				},
			},
			{
				path: 'participant_dashboard',
				component: ParticipantDashboardPageComponent,
				data: {
					right:  Right.PARTICIPANTDASHBOARD
				}
			},
			{
				path: 'admin_dashboard',
				component: MjlsiAdminDashboardPageComponent,
				data: {
					right: Right.ADMINDASHBOARD
				}
			},
			{
				path: 'admin_dashboard/organization_dashboard/:id',
				component: SecertaryDashboardPageComponent,
				data: {
					right: Right.ORGANIZATIONDASHBOARD
				},
			},
			{
				path: 'committees',
				component: CommitteeDashboardPageComponent,
				data: {
					right: Right.COMMITTEES_DASHBOARD
				},
			},{
				path: 'board',
				component: BoardSecretaryDashboardPageComponent,
				data: {
					right: Right.BOARD_DASHBOARD
				},
			},{
				path: 'member',
				component: MemberDashboardPageComponent,
				data: {
					right: Right.MEMBER_DASHBOARD
				},
			},
			{
				path: 'committee_dashboard',
				component: CommitteeControlPanelPageComponent,
				data: {
					right: Right.COMMITTEEDASHBOARD
				},
			},
			{
				path: 'days-passed-statistics',
				component: DaysPassedStatisticsPageComponent,
				data: {
					right: Right.COMMITTEEDASHBOARD
				},
			},
			{
				path: 'committee-remain-percentage',
				component: CommitteeRemainPercentagePageComponent,
				data: {
					right: Right.COMMITTEEDASHBOARD
				},
			},
			{
				path: 'most-member-participate',
				component: MostMemberParticipatePageComponent,
				data: {
					right: Right.COMMITTEEDASHBOARD
				},
			},
			{
				path: 'number-of-committees-per-decision-responsible',
				component: NumberOfCommitteesPerDecisionResponsiblePageComponent,
				data: {
					right: Right.COMMITTEEDASHBOARD
				},
			},

		]
	}
];



@NgModule({
  imports: [
	CommonModule,
	RouterModule.forChild(routes),
	DashboardsModule,
	TranslateModule,
	NgxChartsModule,
	PartialsModule,
	TranslateModule ,
	NgbModule,
    NgbNavModule,
  ],
  declarations: [
	  DashboardsPageComponent,
	  SecertaryDashboardPageComponent,
	  ParticipantDashboardPageComponent,
	  MjlsiAdminDashboardPageComponent,
	  MemberDashboardPageComponent,
	  BoardSecretaryDashboardPageComponent,
	  CommitteeDashboardPageComponent,
	  CommitteeControlPanelPageComponent,
   	  DaysPassedStatisticsPageComponent,
      CommitteeRemainPercentagePageComponent,
      MostMemberParticipatePageComponent,
      NumberOfCommitteesPerDecisionResponsiblePageComponent,
	],
    providers: [],
})
export class DashboardsPageModule { }

