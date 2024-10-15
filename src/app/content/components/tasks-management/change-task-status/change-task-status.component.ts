import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
import { NgbModal, ModalDismissReasons, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'm-change-task-status',
	templateUrl: './change-task-status.component.html'
})


export class ChangeTaskStatusComponent implements OnInit {

    closeResult: string;
    taskStatusEnum = TaskStatuses;
    submitted:  boolean = false;
    commenText: string = '';
    modalRef: NgbModalRef;
    @Input() element;
    @Output() error = new EventEmitter();
    @Output() success = new EventEmitter();

	constructor(
        private modalService: NgbModal,
        private taskService: TaskService,
        private layoutUtilsService: LayoutUtilsService,
		) { }

	ngOnInit() {

    }

    open(content) {
        this.modalRef = this.modalService.open(content, { size: 'xl' as 'lg' });

		this.modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
	}

	private getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return `with: ${reason}`;
        }
    }

    save(statusForm) { 
        if (this.element.task_status_id === this.taskStatusEnum.NEW) {
            this.startTask(this.element.id);
        } else if (this.element.task_status_id === this.taskStatusEnum.INPROGRESS) {
            this.endTask(this.element.id);
        }
    }

    startTask(id: any) {
		this.submitted = true;

		this.taskService.startTask<Task>({ 'taskId': id, 'task_comment_text': this.commenText }).
				subscribe(pagedData => {
                    this.resetFlags();
                    this.success.emit(this.taskStatusEnum.INPROGRESS);
                    this.modalRef.close();
				},
					error => {
                        this.resetFlags();
                        this.error.emit(error);
                        this.modalRef.close();
		});
    }
    
    endTask(id: any) {
		this.submitted = true;
			
		this.taskService.endTask<Task>({ 'taskId': id, 'task_comment_text': this.commenText }).
				subscribe(pagedData => {
					this.resetFlags();
                        this.success.emit(this.taskStatusEnum.DONE);
                        this.modalRef.close();
				},
					error => {
						this.resetFlags();
                        this.error.emit(error);
                        this.modalRef.close();
		});
	}

    resetFlags() {
		this.submitted = false;
        this.commenText = '';
	}
}
