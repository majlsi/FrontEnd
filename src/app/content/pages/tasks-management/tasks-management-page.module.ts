import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksManagementPageComponent } from './tasks-management-page.component';
import { TasksAdminDashboardPageComponent } from './tasks-admin-dashboard-page/tasks-admin-dashboard-page.component';
import { TasksMemberDashboardPageComponent } from './tasks-member-dashboard-page/tasks-member-dashboard-page.component';
import { Routes, RouterModule } from '@angular/router';
import { Right } from '../../../core/models/enums/rights';
import { TranslateModule } from '@ngx-translate/core';
import { TaskDetailsPageComponent } from './task-details-page/task-details-page.component';
import { TasksManagementModule } from '../../components/tasks-management/tasks-management.module';
import { CommitteeTaskManagementDashboardPageComponent } from './committee-task-management-dashboard-page/committee-task-management-dashboard-page.component';
import { TasksStatisticsDashboardPageComponent } from './tasks-statistics/tasks-statistics-dashboard-page.component';


const routes: Routes = [
	{
		path: '',
		component: TasksManagementPageComponent,
		children: [
			{
				path: 'member-dashboard',
				component: TasksMemberDashboardPageComponent,
				data: {
					right:  Right.MYTASKDASHBOARD
				}
			},
			{
				path: 'admin-dashboard',
				component: TasksAdminDashboardPageComponent,
				data: {
					right: Right.ORGANIZATIONTASKDASHBOARD
				}
			},
			{
				path: 'task-details/:id',
				component: TaskDetailsPageComponent,
				data: {
					right: Right.TASKDETAILS
				}
			},
			{
				path: 'committee-details/:id',
				component: CommitteeTaskManagementDashboardPageComponent,
				data: {
					right: Right.COMMITTEE_DETAILS
				}
			},
			{
				path: 'statistics',
				component: TasksStatisticsDashboardPageComponent,
				data: {
					right: Right.TASKS_STATISTICS
				}
			}
		]
	}
];


@NgModule({
  imports: [
	CommonModule,
	RouterModule.forChild(routes),
	TasksManagementModule,
	TranslateModule
  ],
  declarations: [
	  	TasksManagementPageComponent,
		TasksAdminDashboardPageComponent,
		TasksMemberDashboardPageComponent,
		TaskDetailsPageComponent,
		CommitteeTaskManagementDashboardPageComponent,
		TasksStatisticsDashboardPageComponent
	]
})
export class TasksManagementPageModule { }
