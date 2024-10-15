import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentStatuses } from '../../../../core/models/enums/document-statuses';
import { Right } from '../../../../core/models/enums/rights';
import { RoleService } from '../../../../core/services/security/roles.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-dashboard-reviews',
  templateUrl: './dashboard-reviews.component.html'
})
export class DashboardReviewsComponent implements OnInit {

  @Input() dashboardDocuments;  
  isArabic: boolean;
	documentStatuses = DocumentStatuses;
  listFlag: boolean;
  editFlag: boolean;
  viewFlag: boolean;
  constructor(private translationService: TranslationService, private router: Router, private roleService: RoleService) { }

  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
    this.checkListFlag();
    this.checkEditFlag();
    this.checkViewFlag();
  }

  edit(id: any) {
		this.router.navigate(['/reviews-room/edit', id]);
	}

	view(id: any) {
		this.router.navigate(['/reviews-room/details', id]);
	}

  checkListFlag() {
		this.roleService.canAccess(Right.REVIEW_ROOM).subscribe(res => {
			if (res.canAccess === 1) {
				this.listFlag = true;
			}
		}, error => { });
	}

checkEditFlag() {
		this.roleService.canAccess(Right.EDIT_DOCUMENT).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}	, error => { });
	}

  checkViewFlag() {
		this.roleService.canAccess(Right.REVIEW_DOCUMENT).subscribe(res => {
			if (res.canAccess === 1) {
				this.viewFlag = true;
			}
		}, error => { });
	}
}
