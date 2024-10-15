import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';

@Component({
  selector: 'm-member-dashboard-page',
  templateUrl: './member-dashboard-page.component.html'
})
export class MemberDashboardPageComponent implements OnInit {

  dashboard;
  constructor(private dashboardService:DashboardService) { }

  ngOnInit() {
    this.getMemberDashboard();
  }


  getMemberDashboard() {
    this.dashboardService.getMemberDashboard().subscribe(res => {
      this.dashboard = res;
    });
  }
}
