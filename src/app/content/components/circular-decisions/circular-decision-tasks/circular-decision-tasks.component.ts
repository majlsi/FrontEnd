import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "../../../../../environments/environment";
import { VoteStatuses } from "../../../../core/models/enums/vote-statuses";
import { LayoutUtilsService } from "../../../../core/services/layout-utils.service";
import { UserService } from "../../../../core/services/security/users.service";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { UploadService } from "../../../../core/services/shared/upload.service";
import { TranslationService } from "../../../../core/services/translation.service";
import { Decision } from "../../../../core/models/decision";
import { VoteResultStatuses } from "../../../../core/models/enums/vote-result-statuses";
import { DatePipe } from "@angular/common";
import { DecisionService } from "../../../../core/services/decision/decision.service";
import { Observable, forkJoin } from "rxjs";
import { NotificationModelTypes } from "../../../../core/models/enums/notification-model-types";
import { NotificationService } from "../../../../core/services/notification/notification.service";
import { TaskStatus } from "../../../../core/models/task-status";

@Component({
	selector: "m-circular-decision-tasks",
	templateUrl: "./circular-decision-tasks.component.html",
	styleUrls: ["./circular-decision-tasks.component.scss"],
})
export class CirculatDecisionTasksComponent implements OnInit {

    decisionId: number;
    decision: Decision = new Decision();
	imagesBaseURL = environment.imagesBaseURL;
	isArabic: boolean = false;
    voteResultStatusesEnum = VoteResultStatuses;
    createdDate: string;
    dueDate: string;
	voteStatuses = VoteStatuses;
	voteStatusId: number;
	userId: number;
	userObs: Observable<any>;
	taskStatus: TaskStatus[];
	tasks = [];

	constructor(private crudService: CrudService,
		private route: ActivatedRoute,
		private translate: TranslateService,
		private translationService: TranslationService,
		private userService: UserService,
        private uploadService: UploadService,
        private datePipe: DatePipe,
        private decisionService: DecisionService,
		private notificationService: NotificationService) {}

	ngOnInit() {
		this.getLanguage();
		this.listenToCircularDecisionChanged();
		this.getCurrentUser();
		this.getTaskStatuses();
        this.route.params.subscribe(params => {
			forkJoin([this.userObs])
				.subscribe(data => {
					this.userId = data[0].user.id;
					if (params['id']) {
						this.decisionId = +params['id']; // (+) converts string 'id' to a number
						this.getDecision();
					}
				});
		});
    }

    getDecision() {
        this.crudService.get<Decision>('admin/circular-decisions',this.decisionId).subscribe(res => {
			this.decision = res;
			this.tasks = [];
			if(this.decision.tasks && this.decision.tasks.length > 0){
				this.tasks = this.decision.tasks;
			}
			this.setVoteStatus();
            this.renderCreatedDate(); 
			this.renderDueDate();
        });
    }


	getTaskStatuses() {
		this.crudService.getList<TaskStatus>('admin/task-statuses').subscribe(
			res => {
				this.taskStatus = res;
			},
			error => {
				// console.log('error');
			});
	}

    
	getLanguage() {
		this.isArabic = this.translationService.isArabic();
	}

	getCurrentUser() {
		this.userObs = this.userService.getCurrentUser();
	}

	setVoteStatus(){
		this.decision.voters.forEach(voter => {
			if (voter.id == this.userId) {
				this.voteStatusId = voter.vote_status_id;
			}
		});
	}

	downloadFile(url: string, name: string) {
		this.uploadService.downloadFile(url).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = name;
			link.click();
		});
	}


	checkFileType(url: string) {
		let extention = url.split('.').pop();
		if (extention) {
			extention = extention.toLowerCase();
		}
		if (['jpeg', 'jpg', 'png'].includes(extention)) {
			return 'image';
		} else if (extention === 'pdf') {
			return 'pdf';
		} else if (['doc', 'docx','txt','odt'].includes(extention)) {
			return 'doc';
		} else if (['avi', 'mov', 'mp4', 'wmv'].includes(extention)) {
			return 'video';
		} else if (['ppt', 'pptx'].includes(extention)) {
			return 'ppt';
		} else if (['xls', 'xlsx'].includes(extention)) {
			return 'xls';
		}
	}

	changeVoteStatus(statusId: number) {
		if(this.voteStatusId != statusId){
			if (statusId === VoteStatuses.YES) {
				this.decisionService.changeCircularDecisionResultToYes(this.decision.id).subscribe(() => {
					this.getDecision()
				});
			} else if (statusId === VoteStatuses.NO) {
				this.decisionService.changeCircularDecisionResultToNo(this.decision.id).subscribe(() => {
					this.getDecision()
				});
			} else if (statusId === VoteStatuses.MAYATTEND) {
				this.decisionService.changeCircularDecisionResultToAbstained(this.decision.id).subscribe(() => {
					this.getDecision()
				});
			}
		}
	}
    
    renderCreatedDate() {

        if (this.decision.creation_same_day) {
            if (this.decision.creation_hour_diff > 0) {
                this.createdDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.ABOUT') + this.decision.creation_hour_diff + 
                this.translate.instant('CIRCULAR_DECISIONS.DETAILS.HOURS');
            } else {
                this.createdDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.ABOUT') + this.decision.creation_minute_diff +
                this.translate.instant('CIRCULAR_DECISIONS.DETAILS.MINUTES');
            }
        }  else {
            this.createdDate = this.datePipe.transform(this.decision.creation_date, "d MMMM y, hh:mm a");
        }
    }

    renderDueDate() {
        if(this.decision.show_due_date){

			if (this.decision.due_months > 0) {
				this.dueDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.IN') + this.decision.due_months +
				this.translate.instant('CIRCULAR_DECISIONS.DETAILS.MONTHS');
			} else if (this.decision.due_days > 0 ){
				this.dueDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.IN') + this.decision.due_days +
				this.translate.instant('CIRCULAR_DECISIONS.DETAILS.DAYS');
			} else if (this.decision.due_hours > 0) {
				this.dueDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.IN') + this.decision.due_hours +
				this.translate.instant('CIRCULAR_DECISIONS.DETAILS.HOURS');
			} else if (this.decision.due_minutes > 0) {
				this.dueDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.IN') + this.decision.due_minutes +
				this.translate.instant('CIRCULAR_DECISIONS.DETAILS.MINUTES');
			}
		} else {
			this.dueDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.IN') + '0' +
				this.translate.instant('CIRCULAR_DECISIONS.DETAILS.DAYS');
		}
	}
	
	listenToCircularDecisionChanged () {
		this.notificationService.notificationData.subscribe(res => {
			if (res.notificationModelId == this.decisionId && res.notificationModelType == NotificationModelTypes.circularDecision) {
				this.getDecision();
			}
		});
	}
}