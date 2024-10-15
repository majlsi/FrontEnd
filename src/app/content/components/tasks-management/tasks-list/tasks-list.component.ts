import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { TranslateService } from '@ngx-translate/core';

// RXJS
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditTaskModalComponent } from '../edit-task-modal/edit-task-modal.component';
import { environment } from '../../../../../environments/environment';
import { Right } from '../../../../core/models/enums/rights';
import { TaskStatuses } from '../../../../core/models/enums/task-statuses';
import { FilterObject } from '../../../../core/models/filter-object';
import { MeetingAgenda } from '../../../../core/models/meeting-agenda';
import { Task } from '../../../../core/models/task';
import { TaskStatus } from '../../../../core/models/task-status';
import { User } from '../../../../core/models/user';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TaskService } from '../../../../core/services/task/task.service';

@Component({
	selector: 'm-tasks-list',
	templateUrl: './tasks-list.component.html',
	providers: [NgbModal]
})


export class TasksListComponent implements OnInit {

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
	addFlag: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;

	@Input() taskStatus: Array<TaskStatus> = [];
	@Input() users: Array<User> = [];
	@Input() agendas: Array<MeetingAgenda> = [];
	@Input() meetingId;
	@Input() voteId;
	@Output() taskDeleted = new EventEmitter();
	modal: any;

	constructor(private _crudService: CrudService,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		private roleService: RoleService,
		private modalService: NgbModal, private taskService: TaskService) {
		// config.backdrop = 'static';
		// config.keyboard = false;
	}


	ngOnInit() {

		this.getLanguage();
		this.checkButtonAccess();
		this.filterObject.SearchObject = {};
		if (this.meetingId) {
			this.filterObject.SearchObject.meeting_id =  this.meetingId;
		}
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

	newTaskAdded() {
		this.paginator.pageIndex = 0;
		this.sort.active = 'task_management.id';
		this.sort.direction = 'desc';
		this.isCollapsed = false;
		this.getList();
	}

	closeCollapse() {
		this.isCollapsed = false;
	}


	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.dataSourceLength = false;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this.filterObject.PageSize = environment.pageSize;
		if(this.voteId){
			this.taskService.getDecisionTasks(this.filterObject,this.voteId).subscribe(res => {
				this.loadingSubject.next(false);
				this.paginatorTotal$ = res.TotalRecords;
				this.dataSource = res.Results;
				if (this.dataSource.length === 0) {
					this.dataSourceLength = true;
				}
			},
				error => {
					this.loadingSubject.next(false);
				});
		}
		if(this.meetingId){
			this.taskService.getMeetingTasks(this.filterObject,this.meetingId).subscribe(res => {
				this.loadingSubject.next(false);
				this.paginatorTotal$ = res.TotalRecords;
				this.dataSource = res.Results;
				if (this.dataSource.length === 0) {
					this.dataSourceLength = true;
				}
			},
				error => {
					this.loadingSubject.next(false);
				});
		}

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
					this.taskDeleted.emit();
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
			this.displayedColumns = ['description','serial_number', 'assigned_to',
				'start_date', 'task_status_id', 'actions'];
		} else {
			this.displayedColumns = ['description','serial_number', 'assigned_to',
				'start_date', 'task_status_id', 'actions'];
		}
	}

	checkButtonAccess() {
		this.checkAddFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
	}

	checkAddFlag() {
		this.roleService.canAccess(Right.ADDNEWTASK).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
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

}

