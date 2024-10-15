
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { MapsAPILoader, AgmMap } from '@agm/core';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';

// Models
import { Meeting } from '../../../../core/models/meeting';
import { TimeZone } from '../../../../core/models/time-zone';
import { Reminder } from '../../../../core/models/reminder';
import { Committee } from './../../../../core/models/committee';
import { MeetingStatuses } from './../../../../core/models/enums/meeting-statuses';
import { Committees } from '../../../../core/models/enums/committees';
import { MeetingTypeCodes } from '../../../../core/models/enums/meeting-type-codes';
import { UserOnlineConfiguration } from '../../../../core/models/user-online-configuration';
import { MomTemplate } from '../../../../core/models/mom-template';

@Component({
	selector: 'm-meeting',
	templateUrl: './meeting.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class MeetingComponent implements OnInit {

	isArabic: boolean = false;

	@Input() meeting = new Meeting();
	submitted: boolean = false;
	meetingId: number;
	edit: boolean = false;
	errors: Array<String>;
	@Input() allCommittees: Array<Committee> = [];

	committeeBindLabel: string = 'committee_name_en';
	proposalBindLabel = 'proposal_title';
	momTemplatelBindLabel = 'template_name_en';

	meetingTypeBindLabel: string = 'meeting_type_name_en';

	@Input() timeZones: Array<TimeZone> = [];
	@Input() userOnlineConfigurations: Array<UserOnlineConfiguration> = [];
	onlineConfigurationBindLabel: string = 'configuration_name_en';

	timeZoneBindLabel: string = 'description_en';

	@Input() reminders: Array<Reminder> = [];
	remindersBindLabel: string = 'reminder_description_en';

	@Input() momTemplates: Array<MomTemplate> = [];

	activeIdString: string;
	addMode: boolean;
	previousUrl: string = '';
	_schedulToTime = { hour: 13, minute: 30 };
	_schedulTomeridian = true;
	_schedulFrommeridian = true;

	@Output() tabChanged: EventEmitter<string> = new EventEmitter();

	meetingTimeToError: boolean = false;
	@Input() canEditMeeting: boolean;
	meetingStatuses = MeetingStatuses;
	meetingTypeCodes = MeetingTypeCodes;

	showError: boolean = false;

	@Input() selectedTimeZone: any;

	@Input() proposals: any;

	zoom: number = 6;
	map: any;

	main: boolean = false;
	hasTimeZone: boolean = true;

	@Output() getMeetingEmitter = new EventEmitter();

	constructor(private _crudService: CrudService,
		private route: ActivatedRoute, private router: Router,
		private _translationService: TranslationService,
		public mapsApiLoader: MapsAPILoader) {
	}



	ngOnInit() {
		this.getLanguage();
		this._schedulToTime = { hour: 13, minute: 30 };
		this._schedulTomeridian = true;
		this.route.params.subscribe(params => {

			if (params['id']) {
				this.meetingId = +params['id']; // (+) converts string 'id' to a number
			}

		});

	}


	redirect() {
		this.router.navigate(['/meetings']);
	}

	hasError(meetingForm: NgForm, field: string, validation: string) {
		if (meetingForm && meetingForm.form.controls[field] && Object.keys(meetingForm.form.controls).length > 0 &&
			meetingForm.form.controls[field].errors && validation in meetingForm.form.controls[field].errors) {
			if (validation) {
				return (meetingForm.form.controls[field].dirty &&
					meetingForm.form.controls[field].errors[validation]) || (this.edit && meetingForm.form.controls[field].errors[validation]);
			}
			return (meetingForm.form.controls[field].dirty &&
				meetingForm.form.controls[field].invalid) || (this.edit && meetingForm.form.controls[field].invalid);
		}
	}

	save(meetingForm: NgForm,previewMeeting: boolean = false) {
		this.submitted = true;
		this.edit = true;
		this.showError = false;
		this.hasTimeZone = this.meeting.time_zone_id ? true : false;
		this.changeMeetingTime();
		if (meetingForm.valid && this.meetingTimeToError === false && this.hasTimeZone === true) { // submit form if valid
			this.setDateModel();
			if (this.meetingId) { // if edit
				this.checkOnlineConfiguration();
				this._crudService.edit<Meeting>('admin/meetings', this.meeting, this.meetingId).subscribe(
					data => {
						this.submitted = false;
						this.getMeetingEmitter.emit();
						if(previewMeeting){
							// redirect to preview meeting
							this.router.navigate(['/preview-meetings/' + data.meeting_version_id]);
						} else {
							this.tabChanged.emit('TAB2');
						}
					},
					error => {
						this.submitted = false;
						this.showError = true;
						if (this.isArabic === true) {
							this.errors = error.error_ar;
						} else {
							this.errors = error.error;
						}

					});
			} else { // if add
				this._crudService.add<Meeting>('admin/meetings', this.meeting).subscribe(
					data => {
						this.submitted = false;
						this.router.navigate(['/meetings/edit/' + data.id]);
					},
					error => {
						this.submitted = false;
						if (error.error_code === 3) {
							this.errors = error.message;
						}
					});
			}
		} else {
			this.submitted = false;
		}
	}

	stakeholdersSelected() {
		let committee = this.allCommittees.find(c => c.id == this.meeting.committee_id)
		if (committee) {
			let code = committee.committee_code;
			if (code && code === Committees.STAKEHOLDERS) return true;
		}
		return false;
	}
	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === true) {
			this.meetingTypeBindLabel = 'meeting_type_name_ar';
			this.timeZoneBindLabel = 'description_ar';
			this.remindersBindLabel = 'reminder_description_ar';
			this.committeeBindLabel = 'committee_name_ar';
			this.onlineConfigurationBindLabel = 'configuration_name_ar';
			this.momTemplatelBindLabel = 'template_name_ar';
		}

	}
	setToDateEqualFrom() {
		this.meeting.meeting_schedule_to_date = {
			month: this.meeting.meeting_schedule_from_date.month,
			year: this.meeting.meeting_schedule_from_date.year,
			day: this.meeting.meeting_schedule_from_date.day
		};
	}

	setDateModel() {
		if (this.meeting.meeting_schedule_from_date != null) {
			if (this.meeting.meeting_schedule_from_date.year != null) {
				// tslint:disable-next-line:max-line-length
				this.meeting.meeting_schedule_from = { month: this.meeting.meeting_schedule_from_date.month, year: this.meeting.meeting_schedule_from_date.year, day: this.meeting.meeting_schedule_from_date.day };
			}
			if (this.meeting.meeting_schedule_from_time.hour != null) {
				this.meeting.meeting_schedule_from.hour = this.meeting.meeting_schedule_from_time.hour;
				this.meeting.meeting_schedule_from.minute = this.meeting.meeting_schedule_from_time.minute;
				this.meeting.meeting_schedule_from.second = this.meeting.meeting_schedule_from_time.second;
			}
		}
		if (this.meeting.meeting_schedule_to_date != null) {
			if (this.meeting.meeting_schedule_to_date.year != null) {
				// tslint:disable-next-line:max-line-length
				this.meeting.meeting_schedule_to = { month: this.meeting.meeting_schedule_to_date.month, year: this.meeting.meeting_schedule_to_date.year, day: this.meeting.meeting_schedule_to_date.day };
			}
			if (this.meeting.meeting_schedule_to_time.hour != null) {
				this.meeting.meeting_schedule_to.hour = this.meeting.meeting_schedule_to_time.hour;
				this.meeting.meeting_schedule_to.minute = this.meeting.meeting_schedule_to_time.minute;
				this.meeting.meeting_schedule_to.second = this.meeting.meeting_schedule_to_time.second;
			}
		}
	}

	changeMeetingTime() {

		if (this.meeting.meeting_schedule_from_time.hour && this.meeting.meeting_schedule_from_time.minute &&
			this.meeting.meeting_schedule_to_time.hour && this.meeting.meeting_schedule_to_time.minute) {
			// || this.meeting_schedule_to_time.minute < this.meeting_schedule_from_time.minute
			if ((this.meeting.meeting_schedule_to_time.hour < this.meeting.meeting_schedule_from_time.hour ||
				(this.meeting.meeting_schedule_to_time.hour === this.meeting.meeting_schedule_from_time.hour &&
					this.meeting.meeting_schedule_to_time.minute <= this.meeting.meeting_schedule_from_time.minute)
			) && (new Date( this.meeting.meeting_schedule_from_date.day + '-' + this.meeting.meeting_schedule_from_date.month + '-' + this.meeting.meeting_schedule_from_date.year) >=
				new Date( this.meeting.meeting_schedule_to_date.day + '-' + this.meeting.meeting_schedule_to_date.month + '-' + this.meeting.meeting_schedule_to_date.year))) {
				this.meetingTimeToError = true;
			} else {
				this.meetingTimeToError = false;
			}
		} else {
			this.meetingTimeToError = false;
		}
	}

	currentLocation() {

	}

	mapReady(map) {
		this.map = map;
	}

	markerDragEnd(m: any, $event: any) {
		this.meeting.location_lat = m.coords.lat;
		this.meeting.location_long = m.coords.lng;
	}

	updateMeetingLocation(data) {
		this.meeting.location_lat = +data.location_lat;
		this.meeting.location_long = +data.location_long;
		this.meeting.meeting_venue_ar = data.meeting_venue_ar;
		this.meeting.meeting_venue_en = data.meeting_venue_en;
	}

	saveMeetingVersion(meetingForm: NgForm){
		// save meeting version
		this.save(meetingForm,true);
	}

	checkOnlineConfiguration(){
		if(this.meeting.online_configuration_id){
			const index = this.userOnlineConfigurations.findIndex(x => x.id == this.meeting.online_configuration_id);
			if(index < 0){
				this.meeting.online_configuration_id = null;
			}
		}
	}

	displayWarning(){
		if(this.meeting.online_configuration_id){
			const index = this.userOnlineConfigurations.findIndex(x => x.id == this.meeting.online_configuration_id);
			if(index < 0){
				return true;
			}
		}
		return false;
	}
}
