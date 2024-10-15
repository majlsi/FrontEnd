import { Component, OnInit } from '@angular/core';
import { Right } from '../../../../core/models/enums/rights';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';
import { RoleService } from '../../../../core/services/security/roles.service';


@Component({
  selector: 'm-board-secretary-dashboard-page',
  templateUrl: './board-secretary-dashboard-page.component.html'
})
export class BoardSecretaryDashboardPageComponent implements OnInit {

  dashboard; 
  addMeetingFlag: boolean;
  addCommitteeFlag: boolean;
  addUserFlag: boolean;
  constructor(private dashboardService: DashboardService, private roleService : RoleService) { }

  ngOnInit() {
    this.getBoardDashboard();
    this.checkAddMeetingFlag()
    this.checkAddUserFlag();
    this.checkAddCommitteeFlag();
  }


  getBoardDashboard() {
    this.dashboardService.getBoardDashboard().subscribe(res => {
      this.dashboard = res;
    });
  }
  checkAddMeetingFlag() {
		this.roleService.canAccess(Right.ADDNEWMEETING).subscribe(res => {
			if (res.canAccess === 1) {
				this.addMeetingFlag = true;
			}
		}, error => { });
	}

  checkAddCommitteeFlag() {
		this.roleService.canAccess(Right.ADDNEWCOMMITTEE).subscribe(res => {
			if (res.canAccess === 1) {
				this.addCommitteeFlag = true;
			}
		}, error => { });
	}
  checkAddUserFlag() {
		this.roleService.canAccess(Right.USERSADD).subscribe(res => {
			if (res.canAccess === 1) {
				this.addUserFlag = true;
			}
		}, error => { });
	}
}
