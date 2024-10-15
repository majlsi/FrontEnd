import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../../../core/services/security/roles.service';
import { TaskStatus } from '../../../../core/models/task-status';
import { Task } from '../../../../core/models/task';
import { TaskStatuses } from '../../../../core/models/enums/task-statuses';
import { environment } from '../../../../../environments/environment';
import { TaskService } from '../../../../core/services/task/task.service';

@Component({
	selector: 'm-task-details',
	templateUrl: './task-details.component.html'
})


export class TaskDetailsComponent implements OnInit {

	taskStatus = [];
	isArabic: boolean;
	task = new Task();
	taskId: number;
	taskStatusEnum = TaskStatuses;
	bindLabelTaskStatus: string = 'task_status_name_ar';
	imagesBaseURL = environment.imagesBaseURL;
	commenText: string = '';
	isStatusChanged: boolean;
	submitted: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private _crudService: CrudService,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private _organizationService: OrganizationService,
		private translate: TranslateService,
		private roleService: RoleService,
		private location: Location,
		private taskService: TaskService) { }

	ngOnInit() {
		this.getTaskStatuses();
		this.getLanguage();

		this.route.params.subscribe(params => {
			if (params['id']) {
				this.taskId = +params['id']; // (+) converts string 'id' to a number
				this.getTask();
			}
		},
			error => {
				// console.log('error');
			});
	}

	getTask() {
		this._crudService.get<Task>('admin/task-management', this.taskId).subscribe(
			res => {
				this.task = res;
			},
			error => {
				// console.log('error');
			});
	}
	back() {
		this.location.back();
	}

	originalOrder(a, b) {
		return 0;
	}


	getTaskStatuses() {
		this._crudService.getList<TaskStatus>('admin/task-statuses').subscribe(
			res => {
				this.taskStatus = res;
			},
			error => {
				// console.log('error');
			});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === false) {
			this.bindLabelTaskStatus = 'task_status_name_en';
		}
	}


	changeStatus() {
		if (this.isStatusChanged) {
			if (this.task.task_status_id === this.taskStatusEnum.INPROGRESS) {
				this.startTask(this.taskId);
			} else if (this.task.task_status_id === this.taskStatusEnum.DONE) {
				this.endTask(this.taskId);
			} else if (this.task.task_status_id === this.taskStatusEnum.NEW) {
				this.newTask(this.taskId);
			}
		} else if (this.commenText) {
			this.addCommentToTask(this.taskId);
		} else {
			this.layoutUtilsService.showActionNotification(this.translate.instant('MEETINGS.TASK.GENERAL.ChANGE_STATUS'), MessageType.Delete);
		}	
	}


	startTask(id: any) {
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.TASK.START.TITLE');
		const _description: string = this.translate.instant('MEETINGS.TASK.START.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.TASK.START.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGS.TASK.START.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.notification(_title, _description,
			_waitDesciption, this.translate.instant('BUTTON.START'), false);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.submitted = false;
				return;
			}
			this.taskService.startTask<Task>({ 'taskId': id, 'task_comment_text': this.commenText }).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.getTask();
					this.resetFlags();
				},
					error => {
						this.getTask();
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);

						} else {
							this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);

						}
						this.resetFlags();
					});
		});
	}

	endTask(id: any) {
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.TASK.END.TITLE');
		const _description: string = this.translate.instant('MEETINGS.TASK.END.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.TASK.END.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGS.TASK.END.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.notification(_title, _description, _waitDesciption,
			this.translate.instant('BUTTON.ENDTASK'), false);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.submitted = false;
				return;
			}
			this.taskService.endTask<Task>({ 'taskId': id, 'task_comment_text': this.commenText }).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.getTask();
					this.resetFlags();
				},
					error => {
						this.getTask();
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);

						} else {
							this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);

						}
						this.resetFlags();
					});
		});
	}

	newTask(id: any) {
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.TASK.NEW.TITLE');
		const _description: string = this.translate.instant('MEETINGS.TASK.NEW.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.TASK.NEW.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGS.TASK.NEW.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.notification(_title, _description,
			_waitDesciption, this.translate.instant('BUTTON.CONFIRM'), false);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.submitted = false;
				return;
			}
			this.taskService.renewTask<Task>({ 'taskId': id, 'task_comment_text': this.commenText }).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.getTask();
					this.resetFlags();
				},
					error => {
						this.getTask();
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);

						} else {
							this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);

						}
						this.resetFlags();
					});
		});
	}

	setStatusChanged() {
		this.isStatusChanged = true;
	}

	resetFlags() {
		this.submitted = false;
		this.isStatusChanged = false;
		this.commenText = '';
	}

	addCommentToTask(taskId) {
		this.submitted = true;
		const _title: string = this.translate.instant('MEETINGS.TASK.COMMENT.TITLE');
		const _description: string = this.translate.instant('MEETINGS.TASK.COMMENT.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.TASK.COMMENT.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGS.TASK.COMMENT.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.notification(_title, _description,
			_waitDesciption, this.translate.instant('BUTTON.CONFIRM'), false);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.submitted = false;
				return;
			}
			this.taskService.addCommentToTask<Task>({ 'taskId': taskId, 'task_comment_text': this.commenText }).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.getTask();
					this.resetFlags();
				},
					error => {
						this.getTask();
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);

						} else {
							this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);

						}
						this.resetFlags();
					});
		});
	}

	objectKeys(object) {
		return Object.keys(object);
	}
}
