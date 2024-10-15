import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CrudService } from "../../../../core/services/shared/crud.service";
import {
	LayoutUtilsService,
	MessageType,
} from "../../../../core/services/layout-utils.service";
import { TranslationService } from "../../../../core/services/translation.service";
import { TranslateService } from "@ngx-translate/core";
import { RoleService } from "../../../../core/services/security/roles.service";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from "../../../../../environments/environment";
import { tap } from "rxjs/operators";
import { merge, BehaviorSubject, Observable } from "rxjs";

import { FilterObject } from "../../../../core/models/filter-object";
import { TaskService } from "../../../../core/services/task/task.service";
import { Right } from "../../../../core/models/enums/rights";
import { Task } from "../../../../core/models/task";
import { TaskStatuses } from "../../../../core/models/enums/task-statuses";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TaskStatus } from "../../../../core/models/task-status";
import { CommitteeService } from "../../../../core/services/committee/committee.service";
import { Committee } from "../../../../core/models/committee";
import { TaskStatisticTypes } from "../../../../core/models/enums/task-statistic-types";
import { EditTaskModalComponent } from "../edit-task-modal/edit-task-modal.component";

export interface PeriodicElement {
	name: string;
	position: string;
	weight: number;
	symbol: string;
}

@Component({
	selector: "m-tasks-admin-dashboard",
	templateUrl: "./tasks-admin-dashboard.component.html",
	styleUrls: ["./tasks-admin-dashboard.component.scss"],
	providers: [NgbModal],
})
export class TasksAdminDashboardComponent implements OnInit {
	dataSource: Array<Task> = [];
	taskStatusEnum = TaskStatuses;
	displayedColumns: string[];
	isArabic: boolean;

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	editFlag: boolean = false;
	deleteFlag: boolean = false;
	dataSourceLength: boolean = false;
	paginatorTotal$: Observable<number>;
	filterObject = new FilterObject();
	canViewDetails: boolean = false;
	canViewCommitteeDetails: boolean = false;
	taskCount: any;
	modal: any;
	taskStatus: Array<TaskStatus> = [];

	chartData: any[];
	Xticks: any[];

	view: any[] = [550, 300];

	// options
	showLabels: boolean = true;
	animations: boolean = true;
	xAxis: boolean = true;
	yAxis: boolean = true;
	showYAxisLabel: boolean = true;
	showXAxisLabel: boolean = true;
	xAxisLabel: string = "";
	yAxisLabel: string = "";
	timeline: boolean = false;
	colorScheme = {
		domain: ["#F6861F", "#5AA454"],
	};
	legendTitle: string;
	lang: number;
	isCollapsed: boolean = false;
	committees: Array<Committee> = [];
	bindLabel: string = "committee_name_ar";
	canViewTaskStatistic: boolean = false;
	taskStatisticTypes = TaskStatisticTypes;
	isNoTasks: boolean = false;
	tasksStatistics: Array<any>;

	constructor(
		private route: ActivatedRoute,
		private taskService: TaskService,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		private committeeService: CommitteeService,
		private roleService: RoleService,
		private _crudService: CrudService,
		private modalService: NgbModal
	) { }

	ngOnInit() {
		this.getLanguage();
		this.checkButtonAccess();
		this.getTaskStatuses();
		this.getOrganizationMeetingCommittees();
		this.filterObject.SearchObject = {};
	}

	ngAfterViewInit(): void {
		/* Data load will be triggered in two cases:
	- when a pagination event occurs => this.paginator.page
	- when a sort event occurs => this.sort.sortChange
	**/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.getList();
				})
			)
			.subscribe();
		this.getList();
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.PageSize = this.pageSize;
		this.dataSourceLength = false;
		this.filterObject.SortDirection =
			this.sort.direction !== "" ? this.sort.direction : this.sort.start;
		this.taskService.organizationTaskDashboard(this.filterObject).subscribe(
			(res) => {
				this.loadingSubject.next(false);
				this.paginatorTotal$ = res["organizationTasks"].TotalRecords;
				this.dataSource = res["organizationTasks"].Results;
				this.taskCount = res["organizationTasksCounts"];
				//this.chartData = this.isArabic ? res['chart']['chartAr'] : res['chart']['chartEn'];
				this.legendTitle =
					this.translate.instant("TASKS_MANAGEMENT.MONTH") +
					" " +
					(this.isArabic
						? res["currentMonthNameAr"]
						: res["currentMonthNameEn"]);
				//this.Xticks = res['chart']['ticks'];
				if (this.dataSource.length === 0) {
					this.dataSourceLength = true;
				}
				this.setTasksStatisticsForChart(this.taskCount);
			},
			(error) => {
				this.loadingSubject.next(false);
			}
		);
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === true) {
			this.displayedColumns = [
				"description",
				'serial_number',
				"assigned_to",
				"committee_name_ar",
				"start_date",
				"task_status_id",
				"actions",
			];
			this.lang = 1;
		} else {
			this.displayedColumns = [
				"description",
				'serial_number',
				"assigned_to",
				"committee_name_en",
				"start_date",
				"task_status_id",
				"actions",
			];
			this.lang = 2;
			this.bindLabel = "committee_name_en";
		}
		this.xAxisLabel = this.translate.instant(
			"TASKS_MANAGEMENT.CHART.XLABEL"
		);
		this.yAxisLabel = this.translate.instant(
			"TASKS_MANAGEMENT.CHART.YLABEL"
		);
	}

	edit(task: any) {

		this.taskService.getTaskDetails(task.id).subscribe(
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
				this.modal.componentInstance.taskId = task.id;
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

	closeModal() {
		this.modal.close();
		this.getList();
	}

	delete(id: any) {
		const _title: string = this.translate.instant(
			"MEETINGS.TASK.DELETE.DELETETASK"
		);
		const _description: string = this.translate.instant(
			"MEETINGS.TASK.DELETE.DESCRIPTION"
		);
		const _waitDesciption: string = this.translate.instant(
			"MEETINGS.TASK.DELETE.WAITDESCRIPTION"
		);
		const _deleteMessage = this.translate.instant(
			"MEETINGS.TASK.DELETE.DELETEMESSAGE"
		);

		const dialogRef = this.layoutUtilsService.deleteElement(
			_title,
			_description,
			_waitDesciption,
			this.translate.instant("BUTTON.DELETE")
		);
		dialogRef.afterClosed().subscribe((res) => {
			if (!res) {
				return;
			}
			this._crudService
				.delete<Task>("admin/task-management", id)
				.subscribe(
					(pagedData) => {
						this.layoutUtilsService.showActionNotification(
							_deleteMessage,
							MessageType.Delete
						);
						this.paginator.pageIndex = 0;
						this.getList();
					},
					(error) => {
						this.loadingSubject.next(false);
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(
								error.error_ar,
								MessageType.Delete
							);
						} else {
							this.layoutUtilsService.showActionNotification(
								error.error,
								MessageType.Delete
							);
						}
					}
				);
		});
	}

	getTaskStatuses() {
		this._crudService.getList<TaskStatus>("admin/task-statuses").subscribe(
			(res) => {
				this.taskStatus = res;
			},
			(error) => { }
		);
	}

	checkButtonAccess() {
		this.checkViewFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
		this.checkCommitteeViewFlag();
		this.checkTasksStatisticFlaf();
	}

	checkEditFlag() {
		this.roleService.canAccess(Right.EDITTASK).subscribe(
			(res) => {
				if (res.canAccess === 1) {
					this.editFlag = true;
				}
			},
			(error) => { }
		);
	}

	checkDeleteFlag() {
		this.roleService.canAccess(Right.DELETE_TASK).subscribe(
			(res) => {
				if (res.canAccess === 1) {
					this.deleteFlag = true;
				}
			},
			(error) => { }
		);
	}

	checkViewFlag() {
		this.roleService.canAccess(Right.TASKDETAILS).subscribe(
			(res) => {
				if (res.canAccess === 1) {
					this.canViewDetails = true;
				}
			},
			(error) => { }
		);
	}

	checkCommitteeViewFlag() {
		this.roleService.canAccess(Right.COMMITTEE_DETAILS).subscribe(
			(res) => {
				if (res.canAccess === 1) {
					this.canViewCommitteeDetails = true;
				}
			},
			(error) => { }
		);
	}

	onSelect(data): void {
		// console.log('Item clicked', JSON.parse(JSON.stringify(data)));
	}

	onActivate(data): void {
		// console.log('Activate', JSON.parse(JSON.stringify(data)));
	}

	onDeactivate(data): void {
		// console.log('Deactivate', JSON.parse(JSON.stringify(data)));
	}

	downloadCommitteeTasks() {
		this.taskService.downloadTasksPdf(this.lang).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement("a");
			link.href = downloadURL;
			link.download =
				this.translate.instant("TASKS_MANAGEMENT.ALL") + ".pdf";
			link.click();
		});
	}

	resetSearch() {
		this.filterObject.SearchObject = {};
		this.getList();
	}

	getOrganizationMeetingCommittees() {
		this.committeeService.getOrganizationCommittees<Committee>().subscribe(
			(res) => {
				this.committees = res;
			},
			(error) => { }
		);
	}

	checkTasksStatisticFlaf() {
		this.roleService.canAccess(Right.TASKS_STATISTICS).subscribe(
			(res) => {
				if (res.canAccess === 1) {
					this.canViewTaskStatistic = true;
				}
			},
			(error) => { }
		);
	}

	redirectToTasksStatistic(type) {
		if (this.canViewTaskStatistic) {
			this.router.navigate(["/tasks-management/statistics"], {
				queryParams: { statisticTypeId: type },
			});
		}
	}

	setTasksStatisticsForChart(taskCount) {
		let arrayData = [];
		arrayData.push({
			name: this.translate.instant("TASKS_MANAGEMENT.NEW_TASKS"),
			value: taskCount.new_tasks,
		});
		arrayData.push({
			name: this.translate.instant("TASKS_MANAGEMENT.PROGRESS_TASKS"),
			value: taskCount.progress_tasks,
		});
		arrayData.push({
			name: this.translate.instant("TASKS_MANAGEMENT.DONE_TASKS"),
			value: taskCount.done_tasks,
		});
		this.tasksStatistics = arrayData;
		this.isNoTasks = taskCount.total_tasks > 0 ? false : true;
	}
}
