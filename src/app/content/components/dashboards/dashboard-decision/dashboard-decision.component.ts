import { Component, Input, OnInit } from '@angular/core';
import { Right } from '../../../../core/models/enums/rights';
import { VoteResultStatuses } from '../../../../core/models/enums/vote-result-statuses';
import { RoleService } from '../../../../core/services/security/roles.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-dashboard-decision',
  templateUrl: './dashboard-decision.component.html'
})
export class DashboardDecisionComponent implements OnInit {

  @Input() dashboardDecisions;  
  isArabic: boolean;
  voteResultStatusesEnum = VoteResultStatuses;
  listFlag: boolean;
  constructor(private translationService:TranslationService ,private roleService : RoleService) { }

  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
    this.checkListFlag();
  }
  checkListFlag() {
		this.roleService.canAccess(Right.DECISIONS_LIST).subscribe(res => {
			if (res.canAccess === 1) {
				this.listFlag = true;
			}
		}, error => { });
	}
}
