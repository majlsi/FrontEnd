import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { TranslateService } from '@ngx-translate/core';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from '../../../../../environments/environment';
import { Right } from '../../../../core/models/enums/rights';
import { PagedResult } from '../../../../core/models/paged-result';
import { FilterObject } from '../../../../core/models/filter-object';
import { tap, finalize } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';
import { Task } from '../../../../core/models/task';
import { TaskStatuses } from '../../../../core/models/enums/task-statuses';
import { TaskService } from '../../../../core/services/task/task.service';


@Component({
	selector: 'm-tasks-member-dashboard',
	templateUrl: './tasks-member-dashboard.component.html'
})
export class TasksMemberDashboardComponent implements OnInit {
	dataSource: Array<Task> = [];
	taskStatusEnum = TaskStatuses;
	displayedColumns: string[];
	isArabic: boolean;
	pageSize = environment.pageSize;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	isCollapsed: boolean = false;
	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	dataSourceLength: boolean = false;
	filterObject = new FilterObject();

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	canViewDetails: boolean = false;
	taskCount: any;

	constructor(private route: ActivatedRoute, private taskService: TaskService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		private roleService: RoleService) { }

	ngOnInit() {

		this.getLanguage();
		this.checkButtonAccess();
		this.filterObject.SearchObject = {};
		this.route.params.subscribe(params => {

		});
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
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this.taskService.myTaskDashboard(this.filterObject).
			subscribe(res => {
				this.loadingSubject.next(false);
				this.paginatorTotal$ = res['myTasks'].TotalRecords;
				this.dataSource = res['myTasks'].Results;
				this.taskCount = res['myTasksCounts'];
				if (this.dataSource.length === 0) {
					this.dataSourceLength = true;
				}
			},
				error => {
					this.loadingSubject.next(false);
				});
	}


	startTask(id: any) {
		const _title: string = this.translate.instant('MEETINGS.TASK.START.TITLE');
		const _description: string = this.translate.instant('MEETINGS.TASK.START.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.TASK.START.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGS.TASK.START.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.notification(_title, _description,
			_waitDesciption, this.translate.instant('BUTTON.START'), false);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.taskService.startTask<Task>({ 'taskId': id }).
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

	endTask(id: any) {
		const _title: string = this.translate.instant('MEETINGS.TASK.END.TITLE');
		const _description: string = this.translate.instant('MEETINGS.TASK.END.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.TASK.END.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGS.TASK.END.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.notification(_title, _description, _waitDesciption,
			this.translate.instant('BUTTON.ENDTASK'), false);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this.taskService.endTask<Task>({ 'taskId': id }).
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

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === true) {
			this.displayedColumns = ['description', 'serial_number',
				'start_date', 'task_status_id', 'actions'];
		} else {
			this.displayedColumns = ['description', 'serial_number',
				'start_date', 'task_status_id', 'actions'];
		}
	}

	checkButtonAccess() {
		this.checkViewFlag();
	}

	checkViewFlag() {
		this.roleService.canAccess(Right.TASKDETAILS).subscribe(res => {
			if (res.canAccess === 1) {
				this.canViewDetails = true;
			}
		}, error => { });
	}

	showSuccess(data) {
		let _deleteMessage = '';
		if (data === this.taskStatusEnum.INPROGRESS) {
			_deleteMessage = this.translate.instant('MEETINGS.TASK.START.DELETEMESSAGE');
		} else if (data === this.taskStatusEnum.DONE) {
			_deleteMessage = this.translate.instant('MEETINGS.TASK.END.DELETEMESSAGE');
		}
		this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
		this.getList();
	}

	showError(error) {
		if (this.isArabic) {
			this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);
		} else {
			this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);
		}
		this.getList();
	}
}


