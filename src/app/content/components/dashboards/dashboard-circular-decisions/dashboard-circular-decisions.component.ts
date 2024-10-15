import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Right } from '../../../../core/models/enums/rights';
import { VoteResultStatuses } from '../../../../core/models/enums/vote-result-statuses';
import { RoleService } from '../../../../core/services/security/roles.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-dashboard-circular-decisions',
  templateUrl: './dashboard-circular-decisions.component.html'
})
export class DashboardCircularDecisionsComponent implements OnInit {

  @Input() dashboardDecisions;  
  isArabic: boolean;
  voteResultStatusesEnum = VoteResultStatuses;
  listFlag: boolean;
  editFlag: boolean;
  viewFlag: boolean;
  addFlag: boolean;

  constructor(private translationService: TranslationService, private router: Router, private roleService: RoleService) { }

  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
    this.checkListFlag();
    this.checkAddFlag();
    this.checkEditFlag();
    this.checkViewFlag();
  }
  edit(id: any) {
		this.router.navigate(['/circular-decisions/edit', id]);
	}

	view(id: any) {
		this.router.navigate(['/circular-decisions/details', id]);
	}

  checkListFlag() {
		this.roleService.canAccess(Right.CIRCULAR_DECISIONS_LIST).subscribe(res => {
			if (res.canAccess === 1) {
				this.listFlag = true;
			}
		}, error => { });
	}

checkEditFlag() {
		this.roleService.canAccess(Right.EDIT_CIRCULAR_DECISION).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}	, error => { });
	}

  checkViewFlag() {
		this.roleService.canAccess(Right.DECISION_DETAILS).subscribe(res => {
			if (res.canAccess === 1) {
				this.viewFlag = true;
			}
		}, error => { });
	}

  checkAddFlag() {
		this.roleService.canAccess(Right.ADD_CIRCULAR_DECISION).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}
}
