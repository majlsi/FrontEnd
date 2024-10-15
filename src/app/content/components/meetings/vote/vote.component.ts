
import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ViewChild, Input, ElementRef } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of, BehaviorSubject } from 'rxjs';
import { NgForm } from '@angular/forms';

// Models
import { MeetingVote } from '../../../../core/models/meeting-vote';
import { MeetingAgenda } from '../../../../core/models/meeting-agenda';
import { VoteType } from '../../../../core/models/vote-type';
import { MeetingStatuses } from './../../../../core/models/enums/meeting-statuses';
import { VoteTypes } from './../../../../core/models/enums/vote-types';


// Services
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { DecisionType } from '../../../../core/models/decision-type';
import { User } from '../../../../core/models/user';

@Component({
	selector: 'm-vote',
	templateUrl: './vote.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class AddVoteComponent implements OnInit {
	@ViewChild('voteErr') MyProp: ElementRef;
	submitted: boolean = false;
	edit: boolean = false;
	meetingId: number;


	@Input() agendas: Array<MeetingAgenda> = [];

	isArabic: boolean = false;
	incomoingPresentedAgendaId: number;
	incomoingPresentedAttachmnet: number;

	@Input() votes: Array<MeetingVote> = [];
	agendabindLabel: string;
	decisionTypeBindLabel: string;
	@Output() tabChanged: EventEmitter<string> = new EventEmitter();
	@Input() canEditMeeting: boolean;
	@Input() meetingStatusId: number;
	meetingStatuses = MeetingStatuses;
	voteTypesEnms = VoteTypes;
	agendasErrorMessage: boolean = false;
	agendaVotesError: string = '';

	@Input() voteTypes: VoteType[];
	@Input() decisionTypes: DecisionType[];
	@Output() getMeetingEmitter = new EventEmitter();

	@Input() vote_participants: Array<any> = [];
	customVoteParticipants: Array<any> = [];

	constructor(
		private route: ActivatedRoute, private router: Router,
		private _translationService: TranslationService,
		private meetingService: MeetingService,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService) {

	}


	ngOnInit() {
		this.customVoteParticipants = this.vote_participants;
		this.getLanguage();
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.meetingId = +params['id'];
			}

			if (this.route.snapshot.queryParamMap.get('agendaId')) {
				this.incomoingPresentedAgendaId = +this.route.snapshot.queryParamMap.get('agendaId');
			}

			if (this.route.snapshot.queryParamMap.get('attachmnetId')) {
				this.incomoingPresentedAttachmnet = +this.route.snapshot.queryParamMap.get('attachmnetId');
			}
		});
	}

	save(votesForm: NgForm, previewMeeting: boolean = false) {
		this.submitted = true;
		this.edit = true;
		this.agendas.forEach(agenda => {
			agenda.VotesNumber = 0;
		});
		this.votes.forEach(vote => {

			this.agendas.filter(function (agenda) {
				if (vote.agenda_id === agenda.id) {
					++agenda.VotesNumber;
				}
			});
		});
		const agendasHaveMaxNumberNumberError = this.agendas.filter(function (agenda) {
			return (agenda.VotesNumber ? agenda.VotesNumber : 0) > 5;
		});

		if (votesForm.valid && agendasHaveMaxNumberNumberError.length === 0) {
			if (this.meetingId) { // if edit
				this.meetingService.setMeetingVotes<any>(this.meetingId, this.votes).subscribe(res => {
					this.submitted = false;
					this.getMeetingEmitter.emit();

					if (previewMeeting) {
						// redirect to preview meeting
						this.router.navigate(['/preview-meetings/' + res.meeting_version_id]);
					} else if (this.incomoingPresentedAgendaId && this.incomoingPresentedAttachmnet) {
						this.getCurrentPresentingAttachment();
					} else {
						this.tabChanged.emit('TAB11');
					}
				},
					error => {
						this.submitted = false;
					});
			}
		} else {
			this.submitted = false;
			if (agendasHaveMaxNumberNumberError.length !== 0) {
				this.agendaVotesError = this.translate.instant('MEETINGS.AGENDA.VALIDATION.AGENDA_VOTES');
				this.MyProp.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
			} else {
				this.agendaVotesError = '';
			}
		}

	}


	appendNewVote() {
		const voteItem = new MeetingVote();
		voteItem.meeting_id = this.meetingId;
		// voteItem.decision_due_date = {
		// 	month: (new Date()).getMonth() + 1,
		// 	year: (new Date()).getFullYear(), 
		// 	day: (new Date()).getDate()
		// };
		this.votes.push(voteItem);
	}

	removeVote(voteIndex: number) {
		const _title: string = this.translate.instant('MEETINGS.VOTE.DELETE.DELETEVOTE');
		const _description: string = this.translate.instant('MEETINGS.VOTE.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGS.VOTE.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGS.VOTE.DELETE.DELETEMESSAGE');
		const _errorMessage = this.translate.instant('MEETINGS.VOTE.DELETE.ERRORMESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description,
			_waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			if (this.votes[voteIndex].id) {
				this.meetingService.deleteMeetingVote<MeetingVote>(this.meetingId, this.votes[voteIndex].id).
					subscribe(pagedData => {
						this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
						this.votes.splice(voteIndex, 1);
					},
						error => {
							this.layoutUtilsService.showActionNotification(_errorMessage, MessageType.Delete);
						});
			} else {
				this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
				this.votes.splice(voteIndex, 1);
			}
		});
	}

	trackFunction(index: number, item: MeetingVote) {
		return index;
	}

	hasError(votesForm: NgForm, field: string, validation: string) {
		if (votesForm && Object.keys(votesForm.form.controls).length > 0 && votesForm.form.controls[field] &&
			votesForm.form.controls[field].errors && validation in votesForm.form.controls[field].errors) {
			if (validation) {
				return (votesForm.form.controls[field].dirty &&
					votesForm.form.controls[field].errors[validation]) || (this.edit && votesForm.form.controls[field].errors[validation]);
			}
			return (votesForm.form.controls[field].dirty &&
				votesForm.form.controls[field].invalid) || (this.edit && votesForm.form.controls[field].invalid);
		}
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === true) {
			this.agendabindLabel = 'agenda_title_ar';
			this.decisionTypeBindLabel = 'decision_type_name_ar';
		} else {
			this.agendabindLabel = 'agenda_title_en';
			this.decisionTypeBindLabel = 'decision_type_name_en';
		}
	}

	autoFillVoteSubject(vote, agendaId, index) {
		const selectedAgenda = this.agendas.filter(function (item) {
			return item.id === agendaId;
		});

		vote.vote_subject_ar = selectedAgenda[0].agenda_description_ar;
		vote.vote_subject_en = selectedAgenda[0].agenda_description_en;
		this.votes[index].vote_participants = null;
		this.onVoteParticipantListOpen(agendaId);
	}

	redirect() {
		this.router.navigate(['/meetings']);
	}

	compareFn(option1: any, option2: any): boolean {
		if (option1 && option2) {
			return option1.user_id === option2.user_id && option1.meeting_guest_id === option2.meeting_guest_id;
		} else {
			return option1 === option2;
		}
	}

	getCurrentPresentingAttachment() {
		this.meetingService.getCurrentPresentingAttachment(this.meetingId).subscribe(res => {
			const attachmentId = +res.attachmentId;
			const meetingAgendaId = +res.meetingAgendaId;

			this.router.navigate(['meetings/' + this.meetingId +
				'/meeting_agenda/' + meetingAgendaId +
				'/attachments/' + attachmentId]);

		}, error => {
			this.router.navigate([
				'meetings/' + this.meetingId +
				'/meeting_agenda/' + this.incomoingPresentedAgendaId +
				'/attachments/' + this.incomoingPresentedAttachmnet]);
		});
	}

	saveMeetingVersion(votesForm: NgForm) {
		// save meeting attachments
		this.save(votesForm, true)
	}

	setToDateEqualFrom(vote, index) {
		this.votes[index].decision_due_date = {
			month: this.votes[index].decision_due_date.month,
			year: this.votes[index].decision_due_date.year,
			day: this.votes[index].decision_due_date.day
		};
	}

	onVoteParticipantListOpen(agendaId, index = null) {
		this.customVoteParticipants = [];
		if (index != null && this.votes[index] && this.votes[index].agenda_id != null) {
			agendaId = this.votes[index].agenda_id;
		}
		if (agendaId != null) {
			const tempParticipant = this.agendas.find(x => x.id === agendaId).participants;
			tempParticipant.forEach(element => {
				const participant = this.vote_participants.find(x => x?.meeting_guest_id === element?.meeting_guest_id
					&& x?.user_id === element?.user_id);
				if (participant != null) {
					this.customVoteParticipants.push(participant);
				}
			});
		}
	}
}
