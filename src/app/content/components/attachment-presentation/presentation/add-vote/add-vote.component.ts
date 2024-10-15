import { MeetingService } from '../../../../../core/services/meeting/meeting.service';
import { Component, Inject, OnInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

// Services
import { TranslationService } from '../../../../../core/services/translation.service';
import { MeetingVote } from '../../../../../core/models/meeting-vote';
import { NgForm } from '@angular/forms';
import { MeetingAgenda } from '../../../../../core/models/meeting-agenda';
import { DecisionType } from '../../../../../core/models/decision-type';


@Component({
	selector: 'm-add-vote',
	templateUrl: './add-vote.component.html'
})
export class AddVoteComponent implements OnInit {
	vote = new MeetingVote();
	closeResult: string;
	submitted: boolean = false;
	edit: boolean = false;
	@Input() meetingId: number;
	@Input() agendaId: number;
	@Input() agendas: Array<MeetingAgenda> = [];
	agendabindLabel: string;
	isArabic: boolean;
	agendaVotesError: boolean = false;
	voteModal: any;
	decisionTypeBindLabel: string;
	@Input() decisionTypes: Array<DecisionType> = [];
	@Input() vote_participants: Array<any> = [];
	customVoteParticipants: Array<any> = [];

	constructor(private modalService: NgbModal, private meetingService: MeetingService,
		private _translationService: TranslationService) { }

	ngOnInit() {
		this.customVoteParticipants = this.vote_participants;
	}


	open(content) {
		this.getLanguage();
		this.vote.agenda_id = this.agendaId;
		this.vote.meeting_id = this.meetingId;
		this.vote.add_from_presentation = true;
		this.autoFillVoteSubject(this.vote, this.agendaId);
		this.voteModal = this.modalService.open(content, { size: 'xl' as 'lg', backdrop: 'static', keyboard: false });
		this.voteModal.result.then((result) => {
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

	autoFillVoteSubject(vote, agendaId) {
		const selectedAgenda = this.agendas.filter(function (item) {
			return item.id === agendaId;
		});

		vote.vote_subject_ar = selectedAgenda[0].agenda_description_ar;
		vote.vote_subject_en = selectedAgenda[0].agenda_description_en;
		this.vote.vote_participants = null;
		this.onVoteParticipantListOpen(agendaId);
	}

	save(votesForm: NgForm) {
		this.submitted = true;
		this.edit = true;
		if (votesForm.valid) {
			this.meetingService.setMeetingVotes<MeetingVote[]>(this.meetingId, [this.vote]).subscribe(res => {
				this.close();
			},
				error => {
					this.submitted = false;
					this.agendaVotesError = true;
				});

		} else {
			this.submitted = false;
		}

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

	close() {
		this.submitted = false;
		this.edit = false;
		this.agendaVotesError = false;
		this.vote = new MeetingVote();
		this.voteModal.close();
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

	setToDateEqualFrom() {
		this.vote.decision_due_date = {
			month: this.vote.decision_due_date.month,
			year: this.vote.decision_due_date.year,
			day: this.vote.decision_due_date.day
		};
	}

	compareFn(option1: any, option2: any): boolean {
		if (option1 && option2) {
			return option1.user_id === option2.user_id || option1.meeting_guest_id === option2.meeting_guest_id;
		} else {
			return option1 === option2;
		}
	}

	onVoteParticipantListOpen(agendaId) {
		this.customVoteParticipants = [];
		if (this.vote && this.vote.agenda_id != null) {
			agendaId = this.vote.agenda_id;
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
