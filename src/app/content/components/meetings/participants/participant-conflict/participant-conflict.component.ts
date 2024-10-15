import { MeetingService } from './../../../../../core/services/meeting/meeting.service';
import { Component, Inject, OnInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';


// Models
import { User } from '../../../../../core/models/user';

// Services
import { TranslationService } from '../../../../../core/services/translation.service';
import { MeetingParticipantConflict } from '../../../../../core/models/meeting-participant-conflict';
import { MeetingStatuses } from '../../../../../core/models/enums/meeting-statuses';

@Component({
	selector: 'm-participant-conflict',
	templateUrl: './participant-conflict.component.html'
})
export class ParticipantConflictComponent implements OnInit {
    meetingParticipants: Array<MeetingParticipantConflict> = [];
    closeResult: string;

	@Input() meetingId: number;
	@Input() participants: Array<User>;
	ids: Array<number> = [];
	@Input() canEdit: boolean;
    meetingStatuses = MeetingStatuses;

	displayedColumns = ['name', 'meeting_title' , 'meeting_schedule_from', 'meeting_schedule_to'];
	isArabic: boolean;

    constructor(private modalService: NgbModal, private meetingService: MeetingService,
        private _translationService: TranslationService) { }

	ngOnInit() {
	}

	open(content) {
		this.getLanguage();
		this.getConflicts();
		this.modalService.open(content, { size: 'xl' as 'lg' }).result.then((result) => {
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

    getConflicts() {
		this.ids = this.participants.map(function (user) {
			return user.id;
		});

		this.meetingService.checkScheduleConflict<MeetingParticipantConflict>(this.meetingId , {'participant_ids': this.ids}).subscribe(res => {
			this.meetingParticipants = res;
		}, error => {

		});
    }


    close () {
		this.meetingParticipants = [];
		this.ids = [];
    }

    getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

}
