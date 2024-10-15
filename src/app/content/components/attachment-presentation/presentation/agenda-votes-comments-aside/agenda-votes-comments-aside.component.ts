import { Component, OnInit, ChangeDetectionStrategy, EventEmitter, Output, Input, ElementRef, ViewChild } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


// Services
import { TranslationService } from '../../../../../core/services/translation.service';
import { MeetingService } from '../../../../../core/services/meeting/meeting.service';

// Models
import { Meeting } from '../../../../../core/models/meeting';
import { MeetingStatuses } from '../../../../../core/models/enums/meeting-statuses';
import { environment } from '../../../../../../environments/environment';
import { VoteStatus } from '../../../../../core/models/vote-status';
import { UserComment } from '../../../../../core/models/user-comment';

// Enums
import { MeetingAttendanceStatuses } from '../../../../../core/models/enums/meeting-attendance-statuses';
import { VoteStatuses } from '../../../../../core/models/enums/vote-statuses';
import { NgForm } from '@angular/forms';
import { Tab } from '../../../../../core/models/enums/tabs';
import { DecisionType } from '../../../../../core/models/decision-type';
import { CrudService } from '../../../../../core/services/shared/crud.service';
import { VoteResultStatuses } from '../../../../../core/models/enums/vote-result-statuses';

@Component({
	selector: 'm-agenda-votes-comments-aside',
	templateUrl: './agenda-votes-comments-aside.component.html',
	styleUrls: ['./agenda-votes-comments-aside.component.scss'],
	changeDetection: ChangeDetectionStrategy.Default
})
export class AgendaVotesCommentsAsideComponent implements OnInit {

	meetingId: number;
	isArabic: boolean = false;
	submitted: boolean = false;
	@Input() meeting = new Meeting();
	@Input() voteStatuses: Array<VoteStatus> = [];
	@Input() openFirstPanel: boolean;
	@Input() attachmentId: number;
	voteStatusEnum = VoteStatuses;
	@Input() panelActive: Array<any>;
	meetingStatuses = MeetingStatuses;
	lang: string;
	imagesBaseURL = environment.imagesBaseURL;
    voteResultStatusesEnum = VoteResultStatuses;

	MeetingAttendanceStatuses = MeetingAttendanceStatuses;
	edit: boolean = false;
	@Output() getMeetingDataEmitter = new EventEmitter();
	@Output() handleActivePanelEmitter = new EventEmitter();
	@Input() vote_participants: Array<any> = [];
	userComment: UserComment = new UserComment();
	commentRequiredError: string = '';
	commentToAgendaId: number;
	commentsMax = 2;
	addNewComment: boolean = false;
	@Input() isVoteEnabled: boolean;
    decisionTypes: Array<DecisionType> = [];

	constructor(private route: ActivatedRoute,
		private translate: TranslateService,
		private translationService: TranslationService,
		private meetingService: MeetingService,
		private _crudService: CrudService,
		private router: Router) {

	}

	ngOnInit() {
		this.getLanguage();
		this.getDecisionTypes();
		this.userComment.comment_text = '';
		this.route.params.subscribe(params => {
			if (params['meeting_id']) {
				this.meetingId = +params['meeting_id'];
			}
		});
	}

	getLanguage() {
		this.isArabic = this.translationService.isArabic();
		if (this.isArabic === true) {
			this.lang = 'ar';
		} else {
			this.lang = 'en';
		}
	}


	toggle(length, agenda): void {
		if (agenda.isShowMore) {
			agenda.commentsMax = length;
		} else {
			agenda.commentsMax = 2;
		}
	}

	changeVoteStatus(voteResult: any, statusId: number, voteId: number) {
		if (statusId === VoteStatuses.YES) {
			this.meetingService.changeVoteResultToYes(voteId, this.meetingId).subscribe(() => {
				this.getMeetingDataEmitter.emit();
			});
		} else if (statusId === VoteStatuses.NO) {
			this.meetingService.changeVoteResultToNo(voteId, this.meetingId).subscribe(() => {
				this.getMeetingDataEmitter.emit();
			});

		} else if (statusId === VoteStatuses.MAYATTEND) {
			this.meetingService.changeVoteResultToAbstained(voteId, this.meetingId).subscribe(() => {
				this.getMeetingDataEmitter.emit();
			});
		}

	}

	panelChanges(event) {
		this.handleActivePanelEmitter.emit(event);
	}

	addComment(agendaMeetingId, agendaComment) {
		this.submitted = true;
		this.userComment.meeting_agenda_id = agendaMeetingId;
		this.userComment.comment_text = agendaComment;

		this.commentRequiredError = '';
		this.commentToAgendaId = agendaMeetingId;
		if (this.userComment.comment_text) {
			if (this.userComment.comment_text.length < 1000) {
				this.meetingService.addOrUpdateUserComment(this.meetingId, this.userComment).subscribe(res => {
					if (this.userComment.id) {
						/** update */
						// const _message = this.translate.instant('VIEW_MEETING.UPDATECOMMENTSUCCESSMSG');
						// this.layoutUtilsService.showActionNotification(_message, MessageType.Create);
					} else {
						/** create */
						// const _message = this.translate.instant('VIEW_MEETING.ADDCOMMENTSUCCESSMSG');
						// this.layoutUtilsService.showActionNotification(_message, MessageType.Create);
						this.userComment = new UserComment();
						this.userComment.comment_text = '';
						this.meeting.current_agenda.current_user_comment = '';
						this.addNewComment = true;
						this.getMeetingDataEmitter.emit();
					}
					this.submitted = false;
				});
			} else {
				this.submitted = false;
			}
		} else {
			this.submitted = false;
			this.commentRequiredError = this.translate.instant('PRESENTATION.VALIDATION.COMMENT_REQUIRED');
		}
	}

	endVote(voteId) {
		this.meetingService.endVote(this.meetingId, { 'vote_id': voteId }).subscribe(res => {
			this.getMeetingDataEmitter.emit();
		}, error => {

		});
	}

	startVote(voteId) {
		this.meetingService.startVote(this.meetingId, { 'vote_id': voteId }).subscribe(res => {
			this.getMeetingDataEmitter.emit();
		}, error => {

		});
	}

	addVote() {
		this.router.navigate(['/meetings/edit', this.meetingId], {
			queryParams: {
				tab: Tab.TAB6,
				agendaId: this.meeting.current_agenda.id,
				attachmnetId: this.attachmentId
			}
		});
	}

	hasError(meetingForm: NgForm, field: string, validation: string) {
		if (meetingForm && Object.keys(meetingForm.form.controls).length > 0 &&
			meetingForm.form.controls[field].errors && validation in meetingForm.form.controls[field].errors) {
			if (validation) {
				return (meetingForm.form.controls[field].dirty &&
					meetingForm.form.controls[field].errors[validation]) || (this.edit && meetingForm.form.controls[field].errors[validation]);
			}
			return (meetingForm.form.controls[field].dirty &&
				meetingForm.form.controls[field].invalid) || (this.edit && meetingForm.form.controls[field].invalid);
		}
	}

	getDecisionTypes() {
		this._crudService.getList<DecisionType>('admin/decision-types').subscribe(res => {
            this.decisionTypes = res;
        }, error => {
        });
	}
}
