import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MeetingAgenda } from '../../../../core/models/meeting-agenda';
import { Task } from '../../../../core/models/task';
import { TaskStatus } from '../../../../core/models/task-status';
import { User } from '../../../../core/models/user';


@Component({
	selector: 'm-edit-task-modal',
	templateUrl: './edit-task-modal.component.html'
})
export class EditTaskModalComponent implements OnInit {
	closeResult: string;
	@Input() taskStatus: Array<TaskStatus> = [];
	@Input() users: Array<User> = [];
	@Input() agendas: Array<MeetingAgenda> = [];
	@Input() taskId: number;
	@Input() task = new Task();

	constructor(
		public activeModal: NgbActiveModal
	) {

	}

	ngOnInit() {
	}


}
