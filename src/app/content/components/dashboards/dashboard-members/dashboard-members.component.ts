import { Component, Input, OnInit } from '@angular/core';
import { Right } from '../../../../core/models/enums/rights';
import { RoleService } from '../../../../core/services/security/roles.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-dashboard-members',
  templateUrl: './dashboard-members.component.html'
})
export class DashboardMembersComponent implements OnInit {

  _members = [];
  isArabic: boolean;
  listFlag: boolean;

  @Input()
  get members() { return this._members; }
  set members(value) {
    if (value) {
      this._members = value;

    }
    else {
      this._members = [];
    }
  } 

  @Input() membersCount;
  
  
  constructor(private translationService: TranslationService , private roleService : RoleService) { }

  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
    this.checkListFlag();
  }
  checkListFlag() {
		this.roleService.canAccess(Right.USERSLIST).subscribe(res => {
			if (res.canAccess === 1) {
				this.listFlag = true;
			}
		}, error => { });
	}
}
