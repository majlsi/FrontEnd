import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MeetingStatuses } from '../../../../core/models/enums/meeting-statuses';
import { Right } from '../../../../core/models/enums/rights';
import { RoleService } from '../../../../core/services/security/roles.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-dashboard-meetings',
  templateUrl: './dashboard-meetings.component.html'
})
export class DashboardMeetingsComponent implements OnInit {
  viewArr : any[] = [600, 235];
  showLegend: boolean = false;
  chartData=[

  ]
  _dashboardMeetings;
  total: number;
  isArabic: boolean;
  listFlag: boolean;
  editFlag: boolean;
	viewFlag: boolean;
  @Input() 
  get dashboardMeetings() { return this._dashboardMeetings; }
  set dashboardMeetings(value) {
    this._dashboardMeetings =value ;
    this.buildChart();
  }

  meetingStatuses = MeetingStatuses;

  constructor(private translationService: TranslationService, private router: Router,	private roleService: RoleService) { }

  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
    this.checkListFlag();
    this.checkViewFlag();
    this.checkEditFlag();
  }


  buildChart(){
    this.isArabic = this.translationService.isArabic();

    this.chartData =  this.isArabic? this._dashboardMeetings.meetings_statistics.statisticsDataAr : this._dashboardMeetings.meetings_statistics.statisticsDataEn;
    this.total = this.chartData.reduce((acc, cur) => acc + Number(cur.value), 0)
  }

  edit(id: any) {
		this.router.navigate(['/meetings/edit', id]);
	}

	view(id: any) {
		this.router.navigate(['/view-meetings', id]);
	}
  checkListFlag() {
		this.roleService.canAccess(Right.MEETINGS).subscribe(res => {
			if (res.canAccess === 1) {
				this.listFlag = true;
			}
		}, error => { });
	}

  checkEditFlag() {
		this.roleService.canAccess(Right.EDITMEETING).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

  checkViewFlag() {
		this.roleService.canAccess(Right.VIEWMEETING).subscribe(res => {
			if (res.canAccess === 1) {
				this.viewFlag = true;
			}
		}, error => { });
	}
}
