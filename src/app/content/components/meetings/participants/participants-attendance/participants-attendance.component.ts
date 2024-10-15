import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

// Models
import { User } from '../../../../../core/models/user';

// Services
import { UserService } from '../../../../../core/services/security/users.service';
import { TranslationService } from '../../../../../core/services/translation.service';
import { MeetingAttendanceStatuses } from '../../../../../core/models/enums/meeting-attendance-statuses';
import { LayoutUtilsService, MessageType } from '../../../../../core/services/layout-utils.service';
import { MeetingService } from '../../../../../core/services/meeting/meeting.service';

@Component({
	selector: 'm-participants-attendance',
	templateUrl: './participants-attendance.component.html'
})
export class ParticipantsAttendanceComponent implements OnInit {

    closeResult: string;
    isArabic: boolean;
    displayedColumns = ['name', 'actions'];
    meetingAttendanceStatuses = MeetingAttendanceStatuses;
    participants: Array<User>;
    @Input() canEditMeeting: boolean;
    @Input() meetingId: number;
    @Output() tackAttendanceEmiter = new EventEmitter();

    constructor(private modalService: NgbModal, private _userService: UserService,
        private _translationService: TranslationService,
        private meetingService: MeetingService,
        private layoutUtilsService: LayoutUtilsService, ) { }

	ngOnInit() {
	}

	open(content) {
        this.getLanguage();
        this.getMeetingParticipants();
        this.listenToMeetingChangeChannel();
		this.modalService.open(content, { size: 'lg' }).result.then((result) => {
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

    getMeetingParticipants () {
        this.meetingService.getMeetingParticipants<any>(this.meetingId).subscribe(res => {
            res.forEach(user => {
                if (user.meeting_attendance_status_id == MeetingAttendanceStatuses.ABSENT && user.is_accept_absent_by_organiser) {
                    user.meeting_attendance_status_id = MeetingAttendanceStatuses.ACCEPT_ABSENT;
                }
            });
            this.participants = res;
        });
    }

    getLanguage() {
		this.isArabic = this._translationService.isArabic();
    }

    attendAll() {
        const data = this.setMeetingAttendanceStatueForParticipants(MeetingAttendanceStatuses.ATTEND);
        this.meetingService.setAttendForMeentingParticipants<any>(this.meetingId, {users_ids: data.users, meeting_guests_ids: data.guests}).subscribe((res) => {
	        this.layoutUtilsService.showActionNotification(this.isArabic ? res.message_ar : res.message, MessageType.Create);
            this.close();
            this.tackAttendanceEmiter.emit();
		}, error => {
            this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Read);
            this.close();
        });
    }

    absentAll() {
        const data = this.setMeetingAttendanceStatueForParticipants(MeetingAttendanceStatuses.ABSENT);
        this.meetingService.setAbsentForMeentingParticipants<any>(this.meetingId, { users_ids: data.users, meeting_guests_ids: data.guests }).subscribe((res) => {
		    this.layoutUtilsService.showActionNotification(this.isArabic ? res.message_ar : res.message, MessageType.Create);
		 	this.close();
            this.tackAttendanceEmiter.emit();
        }, error => {
            this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Read);
            this.close();
        });
    }

    setMeetingAttendanceStatueForParticipants(meetingAttendanceStatusId) {
        const usersIdsArray = [];
        const guestsIdsArray = [];
        this.participants.forEach(user => {
            user.meeting_attendance_status_id = meetingAttendanceStatusId;
            user?.isGuest == true ? guestsIdsArray.push(user.meeting_guest_id) : usersIdsArray.push(user.id);
        });
        return {
            users: usersIdsArray,
            guests: guestsIdsArray
        };
    }

    close () {
    }

    changeAttendStatus(user: User, status) {
        let data = {
            user_id: user?.isGuest == true ? null : user.id,
            meeting_guest_id: user?.isGuest == true ? user.meeting_guest_id : null
        }
        if (status == MeetingAttendanceStatuses.ATTEND) {
			this.meetingService.setAttendForMeentingParticipant<any>(this.meetingId, data).subscribe((res) => {
                const index = this.participants.findIndex(participant => participant.id == user.id);
                this.participants[index].meeting_attendance_status_id = MeetingAttendanceStatuses.ATTEND;
                // this.layoutUtilsService.showActionNotification(this.isArabic? res.message_ar : res.message, MessageType.Create);
                this.close();
                this.tackAttendanceEmiter.emit();
			}, error => {
                const index = this.participants.findIndex(participant => participant.id == user.id);
                this.participants[index].meeting_attendance_status_id = user.meeting_attendance_status_id;
                this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Read);
                this.close();
            });
        } else if (status == MeetingAttendanceStatuses.ABSENT) {
            this.meetingService.setAbsentForMeentingParticipant<any>(this.meetingId, data).subscribe((res) => {
                const index = this.participants.findIndex(participant => participant.id == user.id);
                this.participants[index].meeting_attendance_status_id = MeetingAttendanceStatuses.ABSENT;
                // this.layoutUtilsService.showActionNotification(this.isArabic? res.message_ar : res.message, MessageType.Create);
                this.close();
                this.tackAttendanceEmiter.emit();
            }, error => {
                const index = this.participants.findIndex(participant => participant.id == user.id);
                this.participants[index].meeting_attendance_status_id = user.meeting_attendance_status_id;
                this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Read);
                this.close();
            });
        } else if (status == MeetingAttendanceStatuses.ACCEPT_ABSENT) {
            this.meetingService.setAcceptAbsentForMeentingParticipant<any>(this.meetingId, data).subscribe((res) => {
                const index = this.participants.findIndex(participant => participant.id == user.id);
                this.participants[index].meeting_attendance_status_id = MeetingAttendanceStatuses.ACCEPT_ABSENT;
                // this.layoutUtilsService.showActionNotification(this.isArabic? res.message_ar : res.message, MessageType.Create);
                this.close();
                this.tackAttendanceEmiter.emit();
            }, error => {
                const index = this.participants.findIndex(participant => participant.id == user.id);
                this.participants[index].meeting_attendance_status_id = user.meeting_attendance_status_id;
                this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Read);
                this.close();
            });
        }
    }

    trackUsers(index: number, item: User) {
        return item.id;
    }

    acceptAbsentAll() {
        const data = this.setMeetingAttendanceStatueForParticipants(MeetingAttendanceStatuses.ACCEPT_ABSENT);
        this.meetingService.setAcceptAbsentForMeentingParticipants<any>(this.meetingId, { users_ids: data.users, meeting_guests_ids: data.guests }).subscribe((res) => {
		    this.layoutUtilsService.showActionNotification(this.isArabic ? res.message_ar : res.message, MessageType.Create);
		 	this.close();
            this.tackAttendanceEmiter.emit();
        }, error => {
            this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Read);
            this.close();
        });
    }

    listenToMeetingChangeChannel() {
		window.Echo.channel('meetingDataChanged').listen('.MeetingDataChangedEvent',
			data => {
			    this.getMeetingParticipants();
		}, e => { }
		);
	}
}
