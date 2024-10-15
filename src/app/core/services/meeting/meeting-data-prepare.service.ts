
import { Injectable } from '@angular/core';

@Injectable()
export class MeetingDataPrepareService {


	constructor() {
	}


	meetingLocation(meeting) {
		if (meeting.location_lat && meeting.location_long) {
			meeting.location_lat = +meeting.location_lat;
			meeting.location_long = +meeting.location_long;

		} else {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition((position) => {
					meeting.location_lat = position.coords.latitude;
					meeting.location_long = position.coords.longitude;
				}, function (e) {

				},
					{ timeout: 5000, enableHighAccuracy: true, maximumAge: 30000 });
			}
		}
		return meeting;
	}

	initializeDate(meeting) {
		meeting.meeting_schedule_from_date = {
			month: (new Date()).getMonth() + 1,
			year: (new Date()).getFullYear(), day: (new Date()).getDate()
		};
		meeting.meeting_schedule_to_date = {
			month: (new Date()).getMonth() + 1,
			year: (new Date()).getFullYear(), day: (new Date()).getDate()
		};
		meeting.meeting_schedule_from_time = {
			hour: (new Date()).getHours(),
			minute: (new Date()).getMinutes(), second: (new Date()).getSeconds()
		};
		meeting.meeting_schedule_to_time = {
			hour: (new Date()).getHours() + 1,
			minute: (new Date()).getMinutes(), second: (new Date()).getSeconds()
		};
		return meeting;
	}

	initializeMap(meeting) {
		meeting.location_lat = 24.774265;
		meeting.location_long = 46.738586;
		return meeting;
	}


}
