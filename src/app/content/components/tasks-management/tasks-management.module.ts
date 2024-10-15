import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksAdminDashboardComponent } from './tasks-admin-dashboard/tasks-admin-dashboard.component';
import { TasksMemberDashboardComponent } from './tasks-member-dashboard/tasks-member-dashboard.component';
import { PartialsModule } from '../../partials/partials.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';;
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { TaskDetailsComponent } from './task-details/task-details.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbCollapseModule, NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommitteeTaskManagementDashboardComponent } from './committee-task-management-dashboard/committee-task-management-dashboard.component';
import { ChangeTaskStatusComponent } from './change-task-status/change-task-status.component';
import { TasksStatisticsDashboardComponent } from './tasks-statistics/tasks-statistics-dashboard.component';
import { EditTaskModalComponent } from './edit-task-modal/edit-task-modal.component';
import { TaskComponent } from './task/task.component';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import { TasksComponent } from './tasks.component';
import { dropzone } from '../../../core/config/dropzone';
import { AgmCoreModule } from '@agm/core';
import { DlDateTimeDateModule } from 'angular-bootstrap-datetimepicker';
import { JoditAngularModule } from 'jodit-angular';
import { DragulaModule } from 'ng2-dragula';
import { CustomFormsModule } from 'ngx-custom-validators';
import { DropzoneModule, DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { ChatsModule } from '../chats/chats.module';
@NgModule({
	imports: [
		CommonModule,
		PartialsModule,
		RouterModule,
		TranslateModule,
		MatTooltipModule,
		MatTableModule,
		MatIconModule,
		MatPaginatorModule,
		MatProgressSpinnerModule,
		MatSortModule,
		NgSelectModule,
		NgbModule,
		FormsModule,
		NgxChartsModule,
		NgbCollapseModule,
		NgbNavModule,
		MatTabsModule,
		MatCheckboxModule,
		DlDateTimeDateModule,
		DropzoneModule,
		CustomFormsModule,
		AgmCoreModule,
		GooglePlaceModule,
		DragulaModule,
		ChatsModule,
		JoditAngularModule

	],
		providers: [
		{
			provide: DROPZONE_CONFIG,
			useValue: dropzone
		}
	],
	declarations: [TasksAdminDashboardComponent, TasksMemberDashboardComponent, TaskDetailsComponent, CommitteeTaskManagementDashboardComponent, ChangeTaskStatusComponent, TasksStatisticsDashboardComponent,

		TasksComponent,
		TaskComponent,
		TasksListComponent,
		EditTaskModalComponent,
	],
	exports: [
		TasksAdminDashboardComponent,
		TasksMemberDashboardComponent,
		TaskDetailsComponent,
		CommitteeTaskManagementDashboardComponent,
		ChangeTaskStatusComponent,
		TasksStatisticsDashboardComponent,
		TasksComponent,
		TasksListComponent,
		TaskComponent,
		EditTaskModalComponent,
	]
})
export class TasksManagementModule { }
