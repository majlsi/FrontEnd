import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../../../core/services/security/roles.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from '../../../../../environments/environment';
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';
import { FilterObject } from '../../../../core/models/filter-object';
import { TaskService } from '../../../../core/services/task/task.service';
import { Right } from '../../../../core/models/enums/rights';
import { Task } from '../../../../core/models/task';
import { TaskStatuses } from '../../../../core/models/enums/task-statuses';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskStatus } from '../../../../core/models/task-status';
import { Committee } from '../../../../core/models/committee';
import { TaskStatisticTypes } from '../../../../core/models/enums/task-statistic-types';
import { EditTaskModalComponent } from '../edit-task-modal/edit-task-modal.component';

@Component({
	selector: 'm-committee-task-management-dashboard',
	templateUrl: './committee-task-management-dashboard.component.html',
	styleUrls: ['./committee-task-management-dashboard.component.scss'],
	providers: [NgbModal]
})
export class CommitteeTaskManagementDashboardComponent implements OnInit {

	isArabic: boolean;
	displayedColumns: string[] = ['description', 'serial_number', 'assigned_to', 'start_date', 'task_status_id', 'actions'];
	xAxisLabel: string = '';
	yAxisLabel: string = '';
	canViewDetails: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;
	filterObject = new FilterObject();

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	dataSourceLength: boolean = false;
	paginatorTotal$: Observable<number>;
	dataSource: Array<Task> = [];
	taskCount: any;
	chartData: any[];
	Xticks: any[];
	legendTitle: string;
	committee: Committee;
	committeeId: number;
	modal: any;
	taskStatus: Array<TaskStatus> = [];
	canViewTaskStatistic: boolean = false;
	taskStatisticTypes = TaskStatisticTypes;


	taskStatusEnum = TaskStatuses;
	legend: boolean = true;
	showLabels: boolean = true;
	animations: boolean = true;
	xAxis: boolean = true;
	yAxis: boolean = true;
	showYAxisLabel: boolean = true;
	showXAxisLabel: boolean = true;
	timeline: boolean = false;
	colorScheme = {
		domain: ['#F6861F', '#5AA454']
	};
	lang: number;
	isNoTasks: boolean = false;

	view: any[] = [550, 300];
	tasksStatistics: Array<any>;

	constructor(
		private _translationService: TranslationService,
		private translate: TranslateService,
		private roleService: RoleService,
		private taskService: TaskService,
		private route: ActivatedRoute,
		private _crudService: CrudService,
		private modalService: NgbModal,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
	) { }

	ngOnInit() {
		this.getLanguage();
		this.checkButtonAccess();
		this.getTaskStatuses();
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
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.committeeId = +params['id']; // (+) converts string 'id' to a number
				this.getList();
			}
		});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		this.lang = this.isArabic ? 1 : 2;
		this.xAxisLabel = this.translate.instant('TASKS_MANAGEMENT.CHART.XLABEL');
		this.yAxisLabel = this.translate.instant('TASKS_MANAGEMENT.CHART.YLABEL');
	}

	checkButtonAccess() {
		this.checkViewFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
		this.checkTasksStatisticFlaf();
	}

	checkViewFlag() {
		this.roleService.canAccess(Right.TASKDETAILS).subscribe(res => {
			if (res.canAccess === 1) {
				this.canViewDetails = true;
			}
		}, error => { });
	}

	checkEditFlag() {
		this.roleService.canAccess(Right.EDITTASK).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

	checkDeleteFlag() {
		this.roleService.canAccess(Right.DELETE_TASK).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => { });
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.PageSize = this.pageSize;
		this.dataSourceLength = false;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this.taskService.organizationCommitteeDashboard(this.filterObject, this.committeeId).
			subscribe(res => {
				this.loadingSubject.next(false);
				this.committee = res['committee'];
				this.paginatorTotal$ = res['committeeTasks'].TotalRecords;
				this.dataSource = res['committeeTasks'].Results;
				this.taskCount = res['committeeTasksCounts'];
				//this.chartData = this.isArabic ? res['chart']['chartAr'] : res['chart']['chartEn'];
				this.legendTitle = this.translate.instant('TASKS_MANAGEMENT.MONTH') + ' ' +
					(this.isArabic ? res['currentMonthNameAr'] : res['currentMonthNameEn']);
				//this.Xticks = res['chart']['ticks'];
				if (this.dataSource.length === 0) {
					this.dataSourceLength = true;
				}
				this.setTasksStatisticsForChart(this.taskCount);
			},
				error => {
					this.loadingSubject.next(false);
				});
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

	delete(id: any) {
		const _title: string = this.translate.instant('MEETINGS.TASK.DELETE.DELETETASK');
		const _description: string = this.translate.instant('MEETINGS.TASK.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.TASK.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGS.TASK.DELETE.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<Task>('admin/task-management', id).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.paginator.pageIndex = 0;
					this.getList();
				},
					error => {
						this.loadingSubject.next(false);
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);

						} else {
							this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);

						}
					});
		});
	}

	getTaskStatuses() {
		this._crudService.getList<TaskStatus>('admin/task-statuses').subscribe(
			res => {
				this.taskStatus = res;
			},
			error => {
			});
	}

	closeModal() {
		this.modal.close();
		this.getList();
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

	back() {
		this.router.navigate(['/tasks-management/admin-dashboard']);
	}

	downloadCommitteeTasks() {
		this.taskService.downloadCommitteeTasksPdf(this.committeeId, this.lang).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = (this.isArabic ?
				(this.committee.committee_name_ar ? this.translate.instant('TASKS_MANAGEMENT.TASKS') + ' ' + this.committee.committee_name_ar
					: this.committee.committee_name_en) : (this.committee.committee_name_en ? this.committee.committee_name_en + ' ' + this.translate.instant('TASKS_MANAGEMENT.TASKS') : this.translate.instant('TASKS_MANAGEMENT.TASKS') + ' ' + this.committee.committee_name_ar)) + '.pdf';
			link.click();
		});
	}

	checkTasksStatisticFlaf() {
		this.roleService.canAccess(Right.TASKS_STATISTICS).subscribe(res => {
			if (res.canAccess === 1) {
				this.canViewTaskStatistic = true;
			}
		}, error => { });
	}

	redirectToTasksStatistic(type) {
		if (this.canViewTaskStatistic) {
			this.router.navigate(['/tasks-management/statistics'], { queryParams: { statisticTypeId: type, committeeId: this.committeeId } });
		}
	}

	setTasksStatisticsForChart(taskCount) {
		let arrayData = [];
		arrayData.push({ name: this.translate.instant('TASKS_MANAGEMENT.NEW_TASKS'), value: taskCount.new_tasks });
		arrayData.push({ name: this.translate.instant('TASKS_MANAGEMENT.PROGRESS_TASKS'), value: taskCount.progress_tasks });
		arrayData.push({ name: this.translate.instant('TASKS_MANAGEMENT.DONE_TASKS'), value: taskCount.done_tasks });
		this.tasksStatistics = arrayData;
		this.isNoTasks = taskCount.total_tasks > 0 ? false : true;
	}
}
