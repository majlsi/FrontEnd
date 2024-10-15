import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Task } from '../../../../core/models/task';
import { TaskStatuses } from '../../../../core/models/enums/task-statuses';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from '../../../../../environments/environment';
import { FilterObject } from '../../../../core/models/filter-object';
import { TranslationService } from '../../../../core/services/translation.service';
import { TaskStatus } from '../../../../core/models/task-status';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Right } from '../../../../core/models/enums/rights';
import { RoleService } from '../../../../core/services/security/roles.service';
import { Committee } from '../../../../core/models/committee';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { tap } from 'rxjs/operators';
import { TaskService } from '../../../../core/services/task/task.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageType, LayoutUtilsService } from '../../../../core/services/layout-utils.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { EditTaskModalComponent } from '../edit-task-modal/edit-task-modal.component';

@Component({
	selector: 'm-tasks-statistics-dashboard',
	templateUrl: './tasks-statistics-dashboard.component.html',
	providers: [NgbModal]
})
export class TasksStatisticsDashboardComponent implements OnInit {

	statisticTypeId: number;
	dataSource: Array<Task> = [];
	isArabic: boolean;
	taskStatusEnum = TaskStatuses;
	displayedColumns: string[];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	isCollapsed: boolean = false;

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	
	dataSourceLength: boolean = false;
	paginatorTotal$: Observable<number>;
	filterObject = new FilterObject();
	taskStatus: Array<TaskStatus> = [];
	canViewDetails: boolean = false;
	canViewCommitteeDetails: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;
	committees: Array<Committee> = [];
	modal: any;
	committeeId: number;
	committee: Committee = new Committee();
	lang: number;

	constructor(private route: ActivatedRoute,
		private _translationService: TranslationService,
		private _crudService: CrudService,
		private roleService: RoleService,
		private committeeService: CommitteeService,
		private taskService: TaskService,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService,
		private modalService: NgbModal,
		private location: Location) { }

	ngOnInit() {
		if (this.route.snapshot.queryParamMap.get('committeeId')) {
			this.committeeId  = + this.route.snapshot.queryParamMap.get('committeeId');
			this.getCommittee();
		}
		
	}

	ngAfterViewInit(): void {
		if (this.route.snapshot.queryParamMap.get('statisticTypeId')) {
			this.statisticTypeId = +this.route.snapshot.queryParamMap.get('statisticTypeId');
			this.getLanguage();
			this.checkButtonAccess();
			this.getTaskStatuses();
			this.getOrganizationMeetingCommittees();
			this.filterObject.SearchObject = {};
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.getList();
					})
				)
				.subscribe();

			this.getList();
		}
	}
	
	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === true) {
			this.displayedColumns = this.committeeId? ['description', 'serial_number','assigned_to',
				'start_date', 'task_status_id', 'actions'] : ['description', 'serial_number', 'assigned_to', 'committee_name_ar',
				'start_date', 'task_status_id', 'actions'] ;
			this.lang = 1;
		} else {
			this.displayedColumns = this.committeeId? ['description', 'serial_number','assigned_to',
				'start_date', 'task_status_id', 'actions'] : ['description', 'serial_number', 'assigned_to', 'committee_name_en',
				'start_date', 'task_status_id', 'actions'];
			this.lang = 2;
		}
	}

	checkButtonAccess() {
		this.checkViewFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
		this.checkCommitteeViewFlag();
	}

	getTaskStatuses() {
		this._crudService.getList<TaskStatus>('admin/task-statuses').subscribe(
			res => {
				this.taskStatus = res;
			},
			error => {
			});
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

	checkCommitteeViewFlag() {
		this.roleService.canAccess(Right.COMMITTEE_DETAILS).subscribe(res => {
			if (res.canAccess === 1) {
				this.canViewCommitteeDetails = true;
			}
		}, error => { });
	}

	getOrganizationMeetingCommittees() {
		this.committeeService.getOrganizationCommittees<Committee>().subscribe(res => {
			this.committees = res;
		}, error => {

		});
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.PageSize = this.pageSize;
		this.dataSourceLength = false;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this.filterObject.SearchObject.task_statistics_type_id = this.statisticTypeId;
		if (this.committeeId) {
			this.filterObject.SearchObject.committee_id = this.committeeId;
		}
		this.taskService.organizationTaskDashboard(this.filterObject).
			subscribe(res => {
				this.loadingSubject.next(false);
				this.paginatorTotal$ = res['organizationTasks'].TotalRecords;
				this.dataSource = res['organizationTasks'].Results;
				if (this.dataSource.length === 0) {
					this.dataSourceLength = true;
				}
			},
				error => {
					this.loadingSubject.next(false);
				});
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

	back() {
		this.location.back();
	}

	getCommittee() {
		this._crudService.get<Committee>('admin/committees', this.committeeId).subscribe(
			res => {
				this.committee = res['Results'];
			},
			error => {
				// console.log('error');
			});
	}

	downloadTasksStatistics() {
		const data = {
			'committee_id': this.committeeId,
			'task_statistics_type_id': this.statisticTypeId
		} 
		this.taskService.downloadTasksStatistics(data,this.lang).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = !this.committeeId? this.translate.instant('TASKS_STATISTICS.TASKS_STATISTICS_' + this.statisticTypeId) + '.pdf' : 
				(this.isArabic?
				(this.committee.committee_name_ar ? this.translate.instant('TASKS_STATISTICS.TASKS_STATISTICS_' + this.statisticTypeId) + '_' + this.committee.committee_name_ar
				: this.committee.committee_name_en)  : (this.committee.committee_name_en ? this.committee.committee_name_en + '_' + this.translate.instant('TASKS_STATISTICS.TASKS_STATISTICS_' + this.statisticTypeId) : this.translate.instant('TASKS_STATISTICS.TASKS_STATISTICS_' + this.statisticTypeId) + '_' +  this.committee.committee_name_ar)) + '.pdf';
			link.click();
		});
	}

	resetSearch() {
		this.filterObject.SearchObject = {};
		this.getList();
	}
}