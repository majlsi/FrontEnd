import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

// Models
import { User } from '../../../../core/models/user';
import { MeetingStatuses } from './../../../../core/models/enums/meeting-statuses';

// Services

import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Observable, forkJoin } from 'rxjs';
import { EnvironmentVariableService } from '../../../../core/services/enviroment-variable/enviroment-variable.service';
import { LdapUsersService } from '../../../../core/services/ldap-users/ldap-users.service';
import { UserService } from '../../../../core/services/security/users.service';


@Component({
	selector: 'm-organisers',
	templateUrl: './organisers.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class OrganisersComponent implements OnInit {

	@Input() organisers: Array<any> = [];
	memberOrganiserSelectet: boolean = false;
	edit: boolean = false;
	submitted: boolean = false;
	meetingId: number;
	isArabic: boolean;

	@Output() tabChanged: EventEmitter<string> = new EventEmitter();
	@Input() canEditMeeting: boolean;
	@Input() meetingStatusId: number;
	meetingStatuses = MeetingStatuses;

	noUsers: boolean = false;
	@Output() getMeetingEmitter = new EventEmitter();

	@Input() users: any;

	bindLabel: string = 'name_ar';

	usersDropDown: Array<User[]> = [];
    LdapSettingObs: Observable<any>;
	ldapSetting: boolean;
	constructor(
		private route: ActivatedRoute, private router: Router,
		private _meetingService: MeetingService,
		private _environmentVariableService: EnvironmentVariableService,
        public _ldapUsersService: LdapUsersService,
		private _userService: UserService,
		private cdr: ChangeDetectorRef,
		private _translationService: TranslationService) {

	}

	ngOnInit() {
		this.getLanguage();
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.meetingId = +params['id']; // (+) converts string 'id' to a number
				this.getMeetingOrganisersForMeeting();
			}
		},
			error => {
				// console.log('error');
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

	hasError(organiserForm: NgForm, field: string, validation: string) {
		if (organiserForm.form.controls[field]) {
			if (organiserForm && Object.keys(organiserForm.form.controls).length > 0 &&
				organiserForm.form.controls[field].errors && validation in organiserForm.form.controls[field].errors) {
				if (validation) {
					return (organiserForm.form.controls[field].dirty &&
						organiserForm.form.controls[field].errors[validation]) ||
						(this.edit && organiserForm.form.controls[field].errors[validation]);
				}
				return (organiserForm.form.controls[field].dirty &&
					organiserForm.form.controls[field].invalid) || (this.edit && organiserForm.form.controls[field].invalid);
			}
		}
	}

	save(organiserForm: NgForm,previewMeeting: boolean = false) {
		this.submitted = true;
		this.edit = true;
		if (organiserForm.valid) {
			if (this.meetingId) { // if edit
				this._meetingService.setMeetingOrganisersForMeeting<any>(this.meetingId, this.organisers).subscribe(res => {
					this.submitted = false;
					this.getMeetingEmitter.emit();
					if (previewMeeting) {
						// redirect to preview meeting
						this.router.navigate(['/preview-meetings/' + res.meeting_version_id]);
					} else {
						this.tabChanged.emit('TAB3');
					}
				},
					error => {

					});
			}
		} else {
			this.submitted = false;
		}

	}

	deleteOrganiser(user) {
		const key = this.organisers.findIndex(function (value: any) { return value.id === user.id; });
		if (key > -1) {
			this.organisers.splice(key, 1);
		}
		if (this.organisers.length === 0) {
			this.memberOrganiserSelectet = false;
		}
		this.prepareUsersDropDown();
	}

	redirect() {
		this.router.navigate(['/meetings']);
	}

	prepareUsersDropDown(event = null, organiserChangedIndex = null) {
		if (this.organisers) {
			this.usersDropDown = [];
			this.organisers.forEach(user => {
				const usersCopy = JSON.parse(JSON.stringify(this.users));
				this.usersDropDown.push(usersCopy);
			});

			this.organisers.forEach((organiser, organiserIndex) => {
				this.usersDropDown.forEach((user, userIndex) => {
					if (organiserIndex !== userIndex) {
						const key = this.usersDropDown[userIndex].findIndex(function (value: any) { return value.id === organiser.id; });
						if (key > -1) {
							
							this.usersDropDown[userIndex].splice(key, 1);
							
						}
						else if(this.ldapSetting && key==-1)
						{   
							this.usersDropDown[userIndex].push(organiser);
							this.cdr.detectChanges();
						}
					}
				});
			});
			if (event != null) {
				const selectedUserIndex = this.users.findIndex(function (value: any) { return value.id === event.id; });
				if(!this.ldapSetting)
				{
					this.organisers[organiserChangedIndex].user_title_en = this.users[selectedUserIndex].user_title_en;
					this.organisers[organiserChangedIndex].user_title_ar = this.users[selectedUserIndex].user_title_ar;
				}
				if(this.ldapSetting && !event.id){

					
					this.addLdapUser(event.username).subscribe(
						(user: User) => {
							if (user.hasOwnProperty('id') && user.id !== undefined)
							{
								const selectedUserIndex = this.users.findIndex(function (value: any) { return value.username === user.username; });
								this.users[selectedUserIndex]=user
								this.organisers[organiserChangedIndex]=this.users[selectedUserIndex];
								this.searchForUsersInLdap(user.username,null);
							}
						},
						(error) => {
						}
					);
				}
			}

			if (this.organisers.length === this.users.length) {
				this.noUsers = true;
			} else {
				this.noUsers = false;
			}
		}

	}

	getMeetingOrganisersForMeeting() {
		if (this.organisers.length > 0) {
			this.memberOrganiserSelectet = true;
		}
		this.prepareUsersDropDown();

	}

	addOrganiser() {

		this.organisers.push(new User());
		if (this.organisers.length !== 0) {
			this.memberOrganiserSelectet = true;
		}
		this.prepareUsersDropDown();
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (!this.isArabic) {
			this.bindLabel = 'name';
		}
	}
	trackParticipants(index: number, item: User) {
		return index;
	}

	saveMeetingVersion(organiserForm: NgForm) {
		// save meeting organisers
		this.save(organiserForm, true);
	}
	public searchForUsersInLdap(term: string, item: any) {
		if(term.length!== 0 && this.ldapSetting)
		{
			this.usersDropDown = [];
			this._userService.getOrganizationUsersStakeholders({ name: term['term'] }).subscribe(
			(data) => {
				this.users = [...data]
				this.prepareUsersDropDown();
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
