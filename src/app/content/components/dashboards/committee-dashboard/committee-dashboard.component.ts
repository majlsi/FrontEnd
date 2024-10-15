import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { Right } from '../../../../core/models/enums/rights';
import { DashboardService } from '../../../../core/services/dashboard/dashboard.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-committee-dashboard',
  templateUrl: './committee-dashboard.component.html'
})
export class CommitteeDashboardComponent implements OnInit {
  dashboard;
  committees: any = [];
  isArabic: boolean;
  activeCommittee = null;
  addMeetingFlag: boolean;
  addUserFlag: boolean;
  constructor(private dashboardService:DashboardService,private translationService: TranslationService , private uploadService: UploadService , private translate : TranslateService,
    private roleService: RoleService) { }

  ngOnInit() {
    this.checkAddMeetingFlag();
    this.checkAddUserFlag();
    this.dashboardService.getUserManagedCommittees().subscribe(res=>{
      this.committees = res.committees;
      if(this.committees.length){
        this.activeCommittee = this.committees[0];
        this.getCommiteeDashBoard();
      }
    });
    this.isArabic = this.translationService.isArabic();
  }


  getCommiteeDashBoard(){
    this.dashboard = null;
    this.dashboardService.getCommitteeDashboard(this.activeCommittee.id).subscribe(res=>{
      this.dashboard = res;
    });
  }

  changeTab($event){
    const id = $event.nextId;
    this.activeCommittee =  this.committees.find(a=> a.id == id);
    if(id){
      this.getCommiteeDashBoard();
    }
  }


  downloadFile(){
    if(this.activeCommittee){
      this.uploadService.downloadFile(environment.imagesBaseURL + this.activeCommittee.governance_regulation_url).subscribe((res) => {
        const downloadURL = window.URL.createObjectURL(res);
        const link = document.createElement("a");
        link.href = downloadURL;
        link.download = this.translate.instant('COMMITTEES.ADD.GOVERNANCE_REGULATION') + '.' + this.activeCommittee.governance_regulation_url.split('.').pop();
        link.click();
      });
    }
	}
  checkAddMeetingFlag() {
		this.roleService.canAccess(Right.ADDNEWMEETING).subscribe(res => {
			if (res.canAccess === 1) {
				this.addMeetingFlag = true;
			}
		}, error => { });
	}

  checkAddUserFlag() {
		this.roleService.canAccess(Right.COMMITTEEEDIT).subscribe(res => {
			if (res.canAccess === 1) {
				this.addUserFlag = true;
			}
		}, error => { });
	}
}
