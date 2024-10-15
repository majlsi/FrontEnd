import { environment } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';

// RXJS
import { forkJoin, Observable } from 'rxjs';

import { CalendarOptions } from '@fullcalendar/core';

import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';

import { MeetingsCalendarDataService } from '../../../../core/services/meetings-calendar/meetings-calendar-data.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { MeetingStatus } from '../../../../core/models/meeting-status';
import { MeetingStatuses } from '../../../../core/models/enums/meeting-statuses';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { Organization } from '../../../../core/models/organization';
import { Right } from '../../../../core/models/enums/rights';
import { RoleService } from '../../../../core/services/security/roles.service';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'm-secertary-dashboard',
  templateUrl: './secertary-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})



export class SecertaryDashboardComponent implements OnInit {

  multi: any[];

  view: any[] = [600, 235];

  colorScheme = {
    domain: ['#5867dd', '#f4516c', '#22b9ff', '#c4c5d6']
  };

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
  viewFlag: boolean = false;

  pageSize = environment.pageSize;
  organizationMeetingStatisticsObs: Observable<any>;
  organizationUserStatisticsObs: Observable<any>;
  organizationGeneralStatisticsObs: Observable<any>;
  numOfMeetings: number;
  numOfUsers: number;
  numOfCommittees: number;
  meetingStatisticsAr: any;
  meetingStatisticsEn: any;
  userStatisticsAr: any;
  userStatisticsEn: any;
  isNoMeetings: boolean = false;
  isNoUsers: boolean = false;
  organizationId: number;
  organization: Organization = new Organization();
  image_url: string = '';

  constructor(
    private route: ActivatedRoute,
    private _crudService: CrudService,
    private router: Router,
    private layoutUtilsService: LayoutUtilsService,
    private translate: TranslateService,
    private _meetingsCalendarDataService: MeetingsCalendarDataService,
    private _translationService: TranslationService,
    private _organizationService: OrganizationService,
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
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.organizationId = +params['id'];
        this.getOrganizationData();
      }
      this.setSearchObject();
      this.getCalendarDataObs();
      this.getMeetingStatuses();
      this.getOrganizationGeneralStatistics();
      this.getOrganizationMeetingStatistics();
      this.getOrganizationUserStatistics();
    });

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

    forkJoin([this.calendarDataObs, this.meetingStatusesObs,
    this.organizationGeneralStatisticsObs, this.organizationMeetingStatisticsObs,
    this.organizationUserStatisticsObs])
      .subscribe(data => {
        this.getCalendarData(data[0]);
        this.meetingStatuses = data[1];
        this.meetingStatuses.forEach((meetingStatus, index) => {
          meetingStatus.color = this.setCalendarStatus(meetingStatus.id);
        });
        this.numOfMeetings = data[2].num_of_meetings;
        this.numOfUsers = data[2].num_of_users;
        this.numOfCommittees = data[2].num_of_committees;


        this.meetingStatisticsAr = data[3].statisticsDataAr;
        this.meetingStatisticsEn = data[3].statisticsDataEn;
        if (data[3].is_no_data) {
          this.isNoMeetings = true;
        }

        this.userStatisticsAr = data[4].statisticsDataAr;
        this.userStatisticsEn = data[4].statisticsDataEn;
        if (data[4].is_no_data) {
          this.isNoUsers = true;
        }

      },
        error => {
          // console.log('error');
        });
  }

  setSearchObject() {
    if (this.organizationId) {
      this.searchObject = {
        'year': this.viewDate.getFullYear(),
        'month': this.viewDate.getMonth() + 1,
        'organization_id': this.organizationId
      };
    } else {
      this.searchObject = {
        'year': this.viewDate.getFullYear(),
        'month': this.viewDate.getMonth() + 1
      };
    }
  }
  eventClick(model) {

    if (isNaN(this.organizationId ) && this.viewFlag === true) {
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
    if (this.organizationId) {
      this.calendarDataObs = this._meetingsCalendarDataService.getCalendarDataListForOrganization(this.searchObject);
    } else {
      this.calendarDataObs = this._meetingsCalendarDataService.getCalendarDataList(this.searchObject);
    }
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
    if (this.organizationId) {
      this.calendarDataObs = this._meetingsCalendarDataService.getCalendarDataListForOrganization(this.searchObject);
    } else {
      this.calendarDataObs = this._meetingsCalendarDataService.getCalendarDataList(this.searchObject);
    }
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

  getOrganizationGeneralStatistics() {
    if (this.organizationId) {
      this.organizationGeneralStatisticsObs = this._organizationService.getOrganizationGeneralStatisticsByOrganizationId(this.organizationId);
    } else {
      this.organizationGeneralStatisticsObs = this._organizationService.getOrganizationGeneralStatistics();
    }
  }


  getOrganizationUserStatistics() {
    if (this.organizationId) {
      this.organizationUserStatisticsObs = this._organizationService.getOrganizationUserStatisticsByOrganizationId(this.organizationId);
    } else {
      this.organizationUserStatisticsObs = this._organizationService.getOrganizationUserStatistics();
    }
  }

  getOrganizationMeetingStatistics() {
    if (this.organizationId) {
      this.organizationMeetingStatisticsObs = this._organizationService.getOrganizationMeetingStatisticsByOrganizationId(this.organizationId);
    } else {
      this.organizationMeetingStatisticsObs = this._organizationService.getOrganizationMeetingStatistics();
    }
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
  }
  mouseOver(model) {
    this.isHidden = !this.isHidden;
  }

  eventrender(event, element, view) {
    // element.find('.fc-title').prepend('<span class="glyphicon"></span> ');
  }

  // Add tooltip to events
  /* eventrender(event, element) {
     event.element[0].querySelectorAll('.fc-content')[0].setAttribute('data-tooltip', event.event.title);
  }*/

  getOrganizationData() {
    this._crudService.get<Organization>('admin/organizations', this.organizationId).subscribe(
      res => {
        this.organization = res;
        this.image_url = environment.imagesBaseURL + this.organization.logo_image.image_url;
      },
      error => {

      });
  }

  checkViewMeetingAccess() {
    this.roleService.canAccess(Right.VIEWMEETING).subscribe(res => {
      if (res.canAccess === 1) {
        this.viewFlag = true;
      }
    }, error => { });
  }


}

