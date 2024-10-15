import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Right } from '../../../../core/models/enums/rights';
import { TaskStatuses } from '../../../../core/models/enums/task-statuses';
import { TaskStatus } from '../../../../core/models/task-status';
import { RoleService } from '../../../../core/services/security/roles.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TaskService } from '../../../../core/services/task/task.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { EditTaskModalComponent } from '../../tasks-management/edit-task-modal/edit-task-modal.component';

@Component({
	selector: 'm-dashboard-tasks',
	templateUrl: './dashboard-tasks.component.html'
})
export class DashboardTasksComponent implements OnInit {
	isArabic: boolean;
	taskStatuses = TaskStatuses;
	_dashboardTasks;
	taskStatus = [];
	modal: any;
	listFlag: boolean;
	viewFlag: boolean;
	editFlag: boolean;
	@Input()
	get dashboardTasks() { return this._dashboardTasks; }
	set dashboardTasks(value) {
		this._dashboardTasks = value;
	}
	@Input() showAssignee;

	@Output() reload = new EventEmitter();

	constructor(private translationService: TranslationService, private router: Router, private taskService: TaskService, private modalService: NgbModal,
		private _crudService: CrudService, private roleService: RoleService) { }

	ngOnInit() {
		this.isArabic = this.translationService.isArabic();
		this.getTaskStatuses();
		this.checkListFlag();
		this.checkEditFlag();
		this.checkViewFlag();
	}


	getTaskStatuses() {
		this._crudService.getList<TaskStatus>("admin/task-statuses").subscribe(
			(res) => {
				this.taskStatus = res;
			},
			(error) => { }
		);
	}
	edit(id: any) {
		this.taskService.getTaskDetails(id).subscribe(
			(res) => {
				this.modal = this.modalService.open(
					EditTaskModalComponent,
					{ size: "lg", backdrop: "static", centered: true }
				);
				this.modal.componentInstance.users =
					res.users;
				this.modal.componentInstance.agendas = res.agendas;
				this.modal.componentInstance.taskStatus = this.taskStatus;
				this.modal.componentInstance.task = res.task;
				this.modal.componentInstance.taskId = id;
				this.modal.result.then(
					(result) => {
						this.closeModal();
					},
					(reason) => { }
				);
			},
			(error) => { }
		);
	}

	view(id: any) {
		this.router.navigate(['/tasks-management/task-details', id]);
	}


	closeModal() {
		this.modal.close();
		this.reload.emit();
	}

	checkListFlag() {
		this.roleService.canAccess(Right.MYTASKDASHBOARD).subscribe(res => {
			if (res.canAccess === 1) {
				this.listFlag = true;
			}
		}, error => { });
	}

	checkEditFlag() {
		this.roleService.canAccess(Right.EDITTASK).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}	, error => { });
	}

  checkViewFlag() {
		this.roleService.canAccess(Right.TASKDETAILS).subscribe(res => {
			if (res.canAccess === 1) {
				this.viewFlag = true;
			}
		}, error => { });
	}
}
