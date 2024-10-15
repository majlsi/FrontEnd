import { environment } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';

// RXJS
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject, forkJoin, Observable } from 'rxjs';


import { CalendarOptions } from '@fullcalendar/core';

import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';

import { MeetingsCalendarDataService } from '../../../../core/services/meetings-calendar/meetings-calendar-data.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { MeetingStatus } from '../../../../core/models/meeting-status';
import { MeetingStatuses } from '../../../../core/models/enums/meeting-statuses';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { Right } from '../../../../core/models/enums/rights';
import { RoleService } from '../../../../core/services/security/roles.service';
import dayGridPlugin from '@fullcalendar/daygrid';


@Component({
	selector: 'm-participant-dashboard',
	templateUrl: './participant-dashboard.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class ParticipantDashboardComponent implements OnInit {
	multi: any[];
	view: any[] = [600, 235];
	colorScheme = {
		domain: ['#5867dd', '#f4516c', '#22b9ff', '#c4c5d6']
	};
	single: any = [
		{
			'name': 'تم إرسال الدعوات',
			'value': 0
		},
		{
			'name': 'تم البدء',
			'value': 0
		},
		{
			'name': 'تم الإنتهاء',
			'value': 0
		},
		{
			'name': 'تم الإلغاء',
			'value': 0
		}
	];

	options: CalendarOptions;
	eventsModel: any;
	viewDate: Date = new Date();
	searchObject = {};
	events: any[];
	calendarDataObs: Observable<any>;
	isArabic: boolean;
	meetingStatusesObs: Observable<MeetingStatus[]>;
	meetingStatusesColors: any;
	meetingStatuses: MeetingStatus[];
	isHidden: boolean = false;

	pageSize = environment.pageSize;
	participantMeetingStatisticsObs: Observable<any>;
	numOfMeetings: number;
	participantMeetingStatisticsAr: any;
	participantMeetingStatisticsEn: any;
	isNoMeetings: boolean = false;
	viewFlag: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private _crudService: CrudService,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private _meetingsCalendarDataService: MeetingsCalendarDataService,
		private _translationService: TranslationService,
		private _meetingService: MeetingService,
		private roleService: RoleService) { }


	ngOnInit() {
		this.meetingStatusesColors = {
			Draft: '#3D5067',
			Published: '#716aca',
			Started: '#7AC7CC',
			Ended: '#8dceb1',
			Cancelled: '#FC4F59',
			AgendaPublished: '#bf98c3'
		};
		this.checkViewMeetingAccess();
		this.getLanguage();
		this.setSearchObject();
		this.getCalendarDataObs();
		this.getMeetingStatuses();
		this.getParticipantMeetingStatistics();
		this.options = {
			initialView: 'dayGridMonth',
			plugins: [dayGridPlugin],
			editable: true,
			eventStartEditable: false,
			defaultAllDay: true,
			slotEventOverlap: false,
			nowIndicator: false,
			navLinks: true, // can click day/week names to navigate views
			headerToolbar: {
				left: 'prev,next today',
				center: 'title',
				right: 'month,agendaWeek,agendaDay,listMonth'
			},
			selectable: true,
			events: [],
			views: {
				month: {
					eventLimit: 4
				},
				week: {
				},
				day: {
					eventLimit: 2
				},
			},

		};
		if (this.isArabic) {
			this.options.locale = 'ar';
			this.options.direction = 'rtl';
			this.options.buttonText = {
				today: 'اليوم', month: 'شهر', week: 'أسبوع', day: 'يوم', list: 'أجندة'
			};
			this.options.moreLinkContent = 'المزيد';

		}

		forkJoin([this.calendarDataObs, this.meetingStatusesObs, this.participantMeetingStatisticsObs])
			.subscribe(data => {
				this.getCalendarData(data[0]);
				this.meetingStatuses = data[1];
				this.meetingStatuses.forEach((meetingStatus, index) => {
					meetingStatus.color = this.setCalendarStatus(meetingStatus.id);
				});
				this.numOfMeetings = data[2].num_of_participant_meetings;
				this.participantMeetingStatisticsAr = data[2].statisticsDataAr;
				this.participantMeetingStatisticsEn = data[2].statisticsDataEn;
				if (data[2].is_no_data) {
					this.isNoMeetings = true;
				}
				// console.log(this.isNoMeetings);

			},
				error => {
					// console.log('error');
				});
	}

	setSearchObject() {
		this.searchObject = {
			'year': this.viewDate.getFullYear(),
			'month': this.viewDate.getMonth() + 1
		};
	}
	eventClick(model) {
		if (this.viewFlag === true) {
			this.router.navigate(['/view-meetings/' + model.event.meetingId]);
		}
	}
	eventDragStop(model) {
		// console.log(model);
	}
	dateClick(model) {
		// console.log(model);
	}
	updateEvents() {
		this.eventsModel = [{
			title: 'Updaten Event',
			start: this.yearMonth + '-08',
			end: this.yearMonth + '-10'
		}];
	}
	get yearMonth(): string {
		const dateObj = new Date();
		return dateObj.getUTCFullYear() + '-' + (dateObj.getUTCMonth() + 1);
	}

	clickButton(model: any) {
		this.viewDate = model.data._d;
		this.setSearchObject();
		this.events = [];
		this.calendarDataObs = this._meetingsCalendarDataService.getCalendarDataList(this.searchObject);
		this.calendarDataObs.subscribe(
			res => {
				this.getCalendarData(res);


			}, error => {

			});
	}



	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}
	getCalendarDataObs() {
		this.calendarDataObs = this._meetingsCalendarDataService.getCalendarDataList(this.searchObject);
	}

	getCalendarData(data) {
		this.events = [];
		data.forEach(meeting => {
			this.setEvent(
				meeting.time_meeting_schedule_from,
				meeting.time_meeting_schedule_to,
				meeting.meeting_title_ar,
				meeting.meeting_title_en,
				meeting.committee_name_ar,
				meeting.committee_name_en,
				meeting.meeting_description_ar,
				meeting.meeting_description_en,
				meeting.num_of_hours,
				meeting.meeting_status_id,
				meeting.id);


		});



	}

	getMeetingStatuses() {
		this.meetingStatusesObs = this._crudService.getList<MeetingStatus>('admin/meetings-statuses');
	}
	getParticipantMeetingStatistics() {
		this.participantMeetingStatisticsObs = this._meetingService.getParticipantMeetingStatistics();

	}
	setEvent(time_from_date, time_to_date, titleAr, titleEn, mettingTyprAr, mettingTyprEn, descriptionAr, descriptionEn, numOfHours,
		statusId, meetingId) {
		const eventObj: any = {};
		eventObj.start = time_from_date;
		eventObj.end = time_to_date;
		eventObj.draggable = false;
		eventObj.allDay = false;
		eventObj.color = this.setCalendarStatus(statusId);
		eventObj.textColor = 'white';

		if (numOfHours >= 24) {
			eventObj.allDay = true;
		} else {
			eventObj.allDay = false;
		}
		if (this.isArabic) {
			if (titleAr) {
				eventObj.title = titleAr + ' (' + mettingTyprAr + ' )';
			} else {
				eventObj.title = titleEn + ' (' + mettingTyprEn + ' )';
			}
			if (descriptionAr) {
				eventObj.description = descriptionAr;
			} else {
				eventObj.description = descriptionEn;
			}

		} else {
			// tslint:disable-next-line:max-line-length
			if (titleEn) { eventObj.title = titleEn + ' (' + mettingTyprEn + ' )'; } else { eventObj.title = titleAr + ' (' + mettingTyprAr + ' )'; }
			if (descriptionEn) { eventObj.description = descriptionEn; } else { eventObj.description = descriptionAr; }
		}
		eventObj.meetingId = meetingId;
		this.events.push(eventObj);
	}


	setCalendarStatus(statusId) {
		if (MeetingStatuses.DRAFT === statusId) {
			return this.meetingStatusesColors.Draft;

		} else if (MeetingStatuses.STARTED === statusId) {
			return this.meetingStatusesColors.Started;

		} else if (MeetingStatuses.PUBLISHED === statusId) {
			return this.meetingStatusesColors.Published;

		} else if (MeetingStatuses.ENDED === statusId) {
			return this.meetingStatusesColors.Ended;

		} else if (MeetingStatuses.CANCELED === statusId) {
			return this.meetingStatusesColors.Cancelled;

		} else if (MeetingStatuses.AGENDAPUBLISHED === statusId) {
			return this.meetingStatusesColors.AgendaPublished;
		}
	}

	mouseLeave(event) {
		// console.log('leave');
	}

	mouseOut(event) {
		this.isHidden = !this.isHidden;
		// console.log('out');
	}
	mouseOver(model) {
		// console.log('over');
		this.isHidden = !this.isHidden;
		// console.log(calendarPopover);


	}

	eventrender(event, element, view) {
		// console.log('dfx');
		// element.find('.fc-title').prepend('<span class="glyphicon"></span> ');
	}

	// Add tooltip to events
	/* eventrender(event, element) {
	   event.element[0].querySelectorAll('.fc-content')[0].setAttribute('data-tooltip', event.event.title);
	}*/

	checkViewMeetingAccess() {
		this.roleService.canAccess(Right.VIEWMEETING).subscribe(res => {
		  if (res.canAccess === 1) {
			this.viewFlag = true;
		  }
		}, error => { });
	  }



}

