import { Component, Inject, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';

// Models
import { User } from '../../../../core/models/user';

// Services
// import { UserService } from '../../../../core/services/security/users.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';


@Component({
	selector: 'm-change-presenter',
	templateUrl: './change-presenter.component.html'
})
export class ChangePresenterComponent implements OnInit {
	users: Array<User> = [];
	closeResult: string;
	selectedAll: boolean = false;
	user: string;
	selectedUsers: Array<User> = [];
	submitted: boolean = false;
	edit: boolean = false;
	atLeastOneSelected: boolean = false;
	isArabic: boolean;
	isOrganiser: boolean = false;
	@Input() meetingAgendaId: number;
	@Input() meetingId: number;
	@Input() presenterUserId: number;
	@Input() attachmentId: number;
	@Input() organizers: Array<User>;
	@Input() participants: Array<User>;
	@Input() vote_participants: Array<any>;
	@Input() endMeetingSubmitted: boolean;
	@Output() closePointerEmiter = new EventEmitter();
	presenterId: number;
	isGuest: boolean;


	displayedColumns = ['select', 'name'];
	agenda: any;
	agendaPresenters: Array<User> = [];

	constructor(private modalService: NgbModal, private _meetingService: MeetingService,
		private _translationService: TranslationService) { }

	ngOnInit() {
		this.getLanguage();
		this.checkIfOrganiserInMeeting();
	}

	open(content) {
		this.presenterId = this.presenterUserId;
		this.modalService.open(content, { size: 'xl' as 'lg' }).result.then((result) => {
			this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
			this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	}

	getPresentersLabel(participant: any) {
		let name = '';
		if (!participant?.meeting_guest_id && participant.user_id) {
			// user
			const index = this.vote_participants.findIndex(p => p.user_id === participant.user_id);
			if (index > -1) {
				name = this.vote_participants[index]?.name;
			}
		} else if (participant?.meeting_guest_id && !participant.user_id) {
			// Guest
			const index = this.vote_participants.findIndex(p => p.meeting_guest_id === participant.meeting_guest_id);
			if (index > -1) {
				name = this.vote_participants[index]?.name;
			}
		}
		return name;
	}

	getAgendaForMeeting() {
		this._meetingService.getAgendaForMeeting(this.meetingId, this.meetingAgendaId).subscribe(res => {
			this.agenda = res;
			this.agendaPresenters = this.agenda.participants;
			/* this.organizers.forEach(
				(organizer, index) => {
					const selectedMeetingType = this.agendaPresenters.filter(function (item) {
						return item.id === organizer.id;
					});
					if (selectedMeetingType.length === 0) {
						this.agendaPresenters.push(organizer);
					}
				}
			);

			if (this.isOrganiser === true) {
				this.participants.forEach(
					(participant, index) => {
						const selectedMeetingType = this.agendaPresenters.filter(function (item) {
							return item.id === participant.id;
						});
						if (selectedMeetingType.length === 0) {
							this.agendaPresenters.push(participant);
						}
					}
				);
			} */

		}, error => {

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



	save(memberForm: NgForm) {
		this.submitted = true;
		this.edit = true;

		if (memberForm.valid) { // submit form if valid
			this.closePointerEmiter.emit();
			this.changePresenter();
			this.close();
		} else {
			this.submitted = false;
		}
	}

	ClickOnPresenters(user) {
		if (user.user_id != null) {
			this.isGuest = false;
		} else if (user.meeting_guest_id != null) {
			this.isGuest = true;
		}
	}
	changePresenter() {
		const data = { 'presenterUserId': this.presenterId, 'isGuest': this.isGuest };
		this._meetingService.changePresenter(this.meetingId, this.attachmentId, data).subscribe((res) => {

		});
	}

	hasError(memberForm: NgForm, field: string, validation: string) {
		if (memberForm && Object.keys(memberForm.form.controls).length > 0 &&
			memberForm.form.controls[field].errors && validation in memberForm.form.controls[field].errors) {
			if (validation) {
				return (memberForm.form.controls[field].dirty &&
					memberForm.form.controls[field].errors[validation]) || (this.edit && memberForm.form.controls[field].errors[validation]);
			}
			return (memberForm.form.controls[field].dirty &&
				memberForm.form.controls[field].invalid) || (this.edit && memberForm.form.controls[field].invalid);
		}
	}

	close() {
		this.user = null;
		this.selectedAll = false;
		this.selectedUsers = [];
		this.submitted = false;
		this.edit = false;
		this.atLeastOneSelected = false;
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	checkIfOrganiserInMeeting() {
		this._meetingService.checkIfOrganiserInMeeting(this.meetingId).subscribe(
			res => {
				this.isOrganiser = res;
				this.getAgendaForMeeting();
			},
			error => { }
		);
	}

}
