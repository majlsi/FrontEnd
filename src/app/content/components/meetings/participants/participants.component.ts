
import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';


// Models
import { User } from '../../../../core/models/user';
import { MeetingStatuses } from './../../../../core/models/enums/meeting-statuses';


// Services
import { TranslationService } from '../../../../core/services/translation.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { DragulaService } from 'ng2-dragula';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { RolesCodes } from '../../../../core/models/enums/roles-codes';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddGuestModalComponent } from '../add-guest-modal/add-guest-modal.component';
import { Observable, forkJoin } from 'rxjs';
import { EnvironmentVariableService } from '../../../../core/services/enviroment-variable/enviroment-variable.service';
import { UserService } from '../../../../core/services/security/users.service';
import { LdapUsersService } from '../../../../core/services/ldap-users/ldap-users.service';

@Component({
	selector: 'm-participants',
	templateUrl: './participants.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class ParticipantsComponent implements OnInit, OnDestroy {

	@Input() participants: Array<any> = [];
	memberParticipantSelectet: boolean = false;
	edit: boolean = false;
	submitted: boolean = false;
	meetingId: number;
	isArabic: boolean;
	rolesCodes = RolesCodes;
	@Output() tabChanged: EventEmitter<string> = new EventEmitter();
	@Input() canEditMeeting: boolean;
	@Input() showSendSignButton: boolean;
	meetingStatuses = MeetingStatuses;
	@Input() users: any;
	@Input() meetingStatusId: number;

	customFilter: any;
	@Output() getMeetingEmitter = new EventEmitter();
	noUsers: boolean = false;

	committeeUsersDropDown: Array<User[]> = [];
	firstUser: User;
    LdapSettingObs: Observable<any>;
	ldapSetting: boolean;
	@Input() hideAddCancel: boolean = false;
	constructor(private route: ActivatedRoute,
		private router: Router,
		private _meetingService: MeetingService,
		private _translationService: TranslationService,
		private dragula: DragulaService,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private _environmentVariableService: EnvironmentVariableService,
        public _ldapUsersService: LdapUsersService,
		private _userService: UserService,
		private modalService: NgbModal) {
	}

	ngOnInit() {
		this.getLanguage();
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.meetingId = +params['id']; // (+) converts string 'id' to a number
				this.getMeetingParticipantsForMeeting();
			}
			if (this.canEditMeeting === false) {
				this.dragula.createGroup('members', {
					moves: (el, container, handle, sibling) => false
				});
			}

		});

		this.getLdapIntegrationFeatureVariable();
        forkJoin([this.LdapSettingObs])
		.subscribe(([LdapSettingRes]) => {
            this.ldapSetting=LdapSettingRes.ldapIntegration;
		}
		,
		error => {
		  });

	}

	ngOnDestroy(): void {
		this.dragula.destroy('members');
	}

	hasError(participatForm: NgForm, field: string, validation: string) {
		if (participatForm.form.controls[field]) {
			if (participatForm && Object.keys(participatForm.form.controls).length > 0 &&
				participatForm.form.controls[field].errors && validation in participatForm.form.controls[field].errors) {
				if (validation) {
					return (participatForm.form.controls[field].dirty &&
						participatForm.form.controls[field].errors[validation]) ||
						(this.edit && participatForm.form.controls[field].errors[validation]);
				}
				return (participatForm.form.controls[field].dirty &&
					participatForm.form.controls[field].invalid) || (this.edit && participatForm.form.controls[field].invalid);
			}
		}
	}

	save(participatForm: NgForm, previewMeeting: boolean = false) {
		this.submitted = true;
		this.edit = true;
		if (participatForm.valid) {
			this.participants.forEach((participant, index) => {
				participant.order = index + 1;
			});
			let members = this.participants.filter(p => !p.isGuest)
			let meetingGuests = this.participants.filter(p => p.isGuest)
			
			if (this.meetingId) { // if edit
				let data = {
					"members": members,
					"guests": meetingGuests,
				}
				this._meetingService.setMeetingParticipantsForMeeting<any>(this.meetingId, data).subscribe(res => {
					this.submitted = false;
					this.getMeetingEmitter.emit();
					if (previewMeeting) {
						// redirect to preview meeting
						this.router.navigate(['/preview-meetings/' + res.meeting_version_id]);
					} else {
						this.tabChanged.emit('TAB4');
					}
				},
					error => {
						this.submitted = false;
					});
			}
		} else {
			this.submitted = false;
		}
	}

	deleteParticipant(user) {
		const key = this.participants.findIndex(function (value: any) { return value.id === user.id; });
		if (key > -1) {
			this.participants.splice(key, 1);
		}
		if (this.participants.length === 0) {
			this.memberParticipantSelectet = false;
		}
		this.prepareCommitteeUsersDropDown();
	}

	addParticipant() {
		this.participants.push(new User());
		if (this.participants.length !== 0) {
			this.memberParticipantSelectet = true;
		}
		this.prepareCommitteeUsersDropDown();

		// this.firstUser = this.committeeUsersDropDown[this.committeeUsersDropDown.length - 1][0];
		// this.participants[this.participants.length - 1].id = this.firstUser.id;
		// this.participants[this.participants.length - 1].user_title_en = this.firstUser.user_title_en;
		// this.participants[this.participants.length - 1].user_title_ar = this.firstUser.user_title_ar;
		// this.participants[this.participants.length - 1].role_id = this.firstUser.role_id;
		// this.participants[this.participants.length - 1].can_sign = true;
		// this.participants[this.participants.length - 1].send_mom = true;

		this.prepareCommitteeUsersDropDown();
	}

	prepareCommitteeUsersDropDown(event = null, participantChangedIndex = null) {
		if (this.participants) {
			this.committeeUsersDropDown = [];
			this.participants.forEach(user => {
				const usersCopy = JSON.parse(JSON.stringify(this.users));
				this.committeeUsersDropDown.push(usersCopy);
			});

			this.participants.forEach((participant, participantIndex) => {
				this.committeeUsersDropDown.forEach((user, userIndex) => {
					if (participantIndex !== userIndex) {
						const key = this.committeeUsersDropDown[userIndex].findIndex(function (value: any) { return value.id === participant.id; });
						if (key > -1) {
							this.committeeUsersDropDown[userIndex].splice(key, 1);
						}
					}
				});
			});

			if (event != null) {
					const selectedUserIndex = this.users.findIndex(function (value: any) { return value.id === event; });
					if(selectedUserIndex>-1)
					{
						this.participants[participantChangedIndex].user_title_en = this.users[selectedUserIndex].user_title_en;
						this.participants[participantChangedIndex].user_title_ar = this.users[selectedUserIndex].user_title_ar;
						this.participants[participantChangedIndex].role_id = this.users[selectedUserIndex].role_id;
						this.participants[participantChangedIndex].can_sign = this.users[selectedUserIndex].can_sign;
						this.participants[participantChangedIndex].role_code = this.users[selectedUserIndex].role.role_code;
						this.participants[participantChangedIndex].send_mom = true;
					}

				if(this.ldapSetting){
					
					const selectedUserIndex = this.users.findIndex(function (value: any) {return value.name.trim() == event.$ngOptionLabel.trim(); });
					let userName=this.users[selectedUserIndex].username;
					this.addLdapUser(userName).subscribe(
						(user: User) => {
							if (user.hasOwnProperty('id') && user.id !== undefined)
							{
								this.participants[participantChangedIndex]=user;
								this.participants[participantChangedIndex].role_code = null;
								this.participants[participantChangedIndex].send_mom = true;
								this.searchForUsersInLdap(user.username,null);
							}
						},
						(error) => {
						}
					);
				}
			}

			if (this.participants.length === this.users.length) {
				this.noUsers = true;
			} else {
				this.noUsers = false;
			}
		}
	}

	getMeetingParticipantsForMeeting() {
		if (this.participants.length > 0) {
			this.memberParticipantSelectet = true;
		}
		this.prepareCommitteeUsersDropDown();
	}

	redirect() {
		this.router.navigate(['/meetings']);
	}


	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}


	updateCanSign(user: User) {
		const index = this.participants.findIndex(function (value: any) { return user.isGuest ? (value.email === user.email) : (value.id === user.id)});
		if (index !== -1) {
			this.participants[index].can_sign = false;
		}
	}

	trackParticipants(index: number, item: User) {
		return item.id;
	}
 
	sendSignEmail(id) {
		const _title: string = this.translate.instant('MEETINGS.SEND_SIGNATURE_MAIL.TITLE');
		const _description: string = this.translate.instant('MEETINGS.SEND_SIGNATURE_MAIL.DESCRIPTIONFORONE');
		const _waitDesciption: string = this.translate.instant('MEETINGS.SEND_SIGNATURE_MAIL.WAITDESCRIPTION');
		const _successMessage = this.translate.instant('MEETINGS.SEND_SIGNATURE_MAIL.SUCCESSMESSAGE');

		const dialogRef = this.layoutUtilsService.meeingActions(_title, _description, _waitDesciption, this.translate.instant('BUTTON.SEND'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.submitted = false;
				return;
			}
			this._meetingService.sendSignatureMailToParticipant(this.meetingId, { user_id: id, meeting_id: this.meetingId }).
				subscribe(pagedData => {
					this.submitted = false;
					this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
					this.getMeetingEmitter.emit();
				},
					error => {
						this.submitted = false;
					});
		});

	}

	saveMeetingVersion(participatForm: NgForm){
		// save meeting participants
		this.save(participatForm, true)
	}

	getMeetingData(){
		this.getMeetingEmitter.emit();
	}

	addGuest() {
		const modalRef = this.modalService.open(AddGuestModalComponent, {
			// size: "sm",
			backdrop: 'static',
			centered: true,
		});
		modalRef.componentInstance.isArabic = this.isArabic;
		modalRef.componentInstance.guestInvited.subscribe(res => {
			let guest = new User();
			guest.isGuest = true;
			guest.email = res;
			this.participants.push(guest);
		})

		modalRef.result.then(
			(result) => {

			},
			(reason) => {
			}
		);
		
	}

	editGuest(guest: any){
		const modalRef = this.modalService.open(AddGuestModalComponent, {
			backdrop: 'static',
			centered: true,
		});
		modalRef.componentInstance.isArabic = this.isArabic;
		modalRef.componentInstance.guest = guest;
		modalRef.componentInstance.guestInvited.subscribe(res => {
			let index = this.participants.findIndex(p => p.email == guest.email && p.isGuest)
			if(index > -1) {
				guest.email = res;
				this.participants[index] = guest;
			}
		})

		modalRef.result.then(
			_ => { },
			_ => { }
		);
	}

	public searchForUsersInLdap(term: string, item: any) {
		if(term.length!== 0 && this.ldapSetting)
		{
			this.committeeUsersDropDown = [];
			this._userService.getOrganizationUsersStakeholders({ name: term['term'] }).subscribe(
			(data) => {
				this.users = [...data]
				this.prepareCommitteeUsersDropDown();;
			},
			(error) => {
			}
			)
		}
	}
    private addLdapUser(userName: string): Observable<any> {
		const encodedUserName = encodeURIComponent(userName);
		const requestBody = { userName: encodedUserName }
		return this._ldapUsersService.getLdapUser(requestBody);
	}
    getLdapIntegrationFeatureVariable() {
		this.LdapSettingObs = this._environmentVariableService.getLdapIntegrationFeatureVariable();
	}
}
