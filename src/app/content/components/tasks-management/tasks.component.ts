import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Right } from '../../../core/models/enums/rights';
import { MeetingAgenda } from '../../../core/models/meeting-agenda';
import { Task } from '../../../core/models/task';
import { TaskStatus } from '../../../core/models/task-status';
import { User } from '../../../core/models/user';
import { RoleService } from '../../../core/services/security/roles.service';


@Component({
	selector: 'm-tasks',
	templateUrl: './tasks.component.html',
})
export class TasksComponent implements OnInit {

	isArabic: boolean = false;
	addFirst: boolean = false;
	showTaskForm: boolean = false;


	@Input() taskStatus: Array<TaskStatus> = [];
	@Input() users: Array<User> = [];
	@Input() agendas: Array<MeetingAgenda> = [];
	@Input() meetingId;
	@Input() voteId;

	@Input() tasks: Array<Task> = [];
	addFlag: boolean = false;
	@Output() getData = new EventEmitter();

	constructor(
		private roleService: RoleService

	) { }

	ngOnInit() {
		this.checkAddFlag();
	}

	addTask() {
		this.showTaskForm = true;
		this.addFirst = true;
	}
	resetAdd() {
		this.addFirst = false;
		this.showTaskForm = false;
	}

	taskAdded() {
		this.getData.emit();
		this.showTaskForm = false;
	}

	taskDeleted() {
		this.getData.emit();
		this.showTaskForm = false;
		this.addFirst = false;
	}

	checkAddFlag() {
		this.roleService.canAccess(Right.ADDNEWTASK).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}

}
