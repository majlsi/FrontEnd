
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from '../../../../core/services/translation.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { Meeting } from '../../../../core/models/meeting';




@Component({
  selector: 'm-view-meeting-statistics',
  templateUrl: './view-meeting-statistics.component.html',
  styleUrls: ['./view-meeting-statistics.component.scss']
})


export class ViewMeetingStatisticsComponent implements OnInit {


  view: any[] = [600, 300];

  // options
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  isDoughnut: boolean = false;
  isArabic: boolean;
  @Input() statisticsDataAr;
  @Input() statisticsDataEn;
  @Input() meetingData;

  colorScheme = {
    domain: ['#28A745', '#DC3545', '#f07c12', '#2F4F4F', '#D1D4D7']
  };

  constructor(private modalService: NgbModal,
    public activeModal: NgbActiveModal,
    private _translationService: TranslationService,
    private meetingService: MeetingService) { }


  ngOnInit() {
    this.getLanguage();
    this.listenToMeetingChangeChannel();
  }



  getLanguage() {
    this.isArabic = this._translationService.isArabic();
  }

  listenToMeetingChangeChannel() {
		window.Echo.channel('meetingDataChanged').listen('.MeetingDataChangedEvent',
			data => {
				this.getMeeting();
		}, e => { }
		);
  }
  
  getMeeting() {
    this.meetingService.getMeetingAllData<Meeting>(this.meetingData.id).subscribe(res => {
			this.meetingData = res;
			this.statisticsDataAr = this.meetingData.participantStatistics.statisticsDataAr;
      this.statisticsDataEn = this.meetingData.participantStatistics.statisticsDataEn;
		});
  }
}







