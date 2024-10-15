import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { Right } from '../../../../core/models/enums/rights';
import { RoleService } from '../../../../core/services/security/roles.service';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-dashboard-commities',
  templateUrl: './dashboard-commities.component.html'
})
export class DashboardCommitiesComponent implements OnInit {

  _committees = [];
  isArabic: boolean;
  @Input() membersCount;
  listFlag: boolean;

  @Input()
  get committees() { return this._committees; }
  set committees(value) {
    if (value) {
      this._committees = value;

    }
    else {
      this._committees = [];
    }
  } 

  @Input() committeesCount;
  
  
  constructor(private translationService: TranslationService, private uploadService: UploadService , 
    private translate : TranslateService, private roleService : RoleService) { }

  ngOnInit() {
    this.isArabic = this.translationService.isArabic();
    this.checkListFlag();
  }
	downloadFile(committee){
		this.uploadService.downloadFile(environment.imagesBaseURL +  committee.governance_regulation_url).subscribe((res) => {
			const downloadURL = window.URL.createObjectURL(res);
			const link = document.createElement("a");
			link.href = downloadURL;
			link.download = this.translate.instant('COMMITTEES.ADD.GOVERNANCE_REGULATION') + '.' + committee.governance_regulation_url.split('.').pop();
			link.click();
		});
	}

  checkListFlag() {
		this.roleService.canAccess(Right.COMMITTEES).subscribe(res => {
			if (res.canAccess === 1) {
				this.listFlag = true;
			}
		}, error => { });
	}
}
