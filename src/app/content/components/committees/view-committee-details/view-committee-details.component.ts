import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { CommitteeTypeEnum } from '../../../../core/models/enums/committee-Types';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { CommitteeRequestService } from '../../../../core/services/request/committeeRequest.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { UploadService } from '../../../../core/services/shared/upload.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RejectRequestComponent } from '../../committee-requests/reject-request/reject-request.component';
import { Request } from '../../../../core/models/request';
import { Committee } from '../../../../core/models/committee';
import { User } from '../../../../core/models/user';
import { Observable, forkJoin } from 'rxjs';
import { CommitteeUserRequest } from '../../../../core/models/committee-user-request';
import { CommitteeStatus } from '../../../../core/models/committee-status';
import { CommitteeType } from '../../../../core/models/committee-type';
import { EnvironmentVariableService } from '../../../../core/services/enviroment-variable/enviroment-variable.service';

@Component({
  selector: 'm-view-committee-details',
  templateUrl: './view-committee-details.component.html',
  styleUrls: []
})
export class ViewCommitteeDetailsComponent implements OnInit {
  committee = new Committee();
  committeeId: number;
  memberUserSelectet: boolean = false;
  errors: Array<String>;
  isArabic: boolean;
  error: Array<any>;
  removeCommitteeCode: boolean = false;
  committeeTypeEnum = CommitteeTypeEnum;
  displayedColumns = ['name', 'email', 'committee_user_start_date', 'committee_user_expired_date'];
  displayedColumnsNewSetting = ['name', 'email', 'status', 'committee_user_start_date', 'committee_user_expired_date', 'member_evaluation'];
  recommendationDisplayedColumns = ['recommendation_body'];
  startDateModel: any;
  expiredDateModel: any;
  decisionDateModel: any;
  attachmentUrl: string;
  attachmentDecisionUrl: string;
  addUserFeatureSettingObs: Observable<any>;
  addUserFeatureSetting: boolean;
  usersCommitteeCombinedArray: any[];
  committeeUsersRequest: Array<any> = [];
  customSettingObs: Observable<any>;
  customSetting: boolean;
  customSettingDeleteObs: Observable<any>;
  customSettingDelete: boolean;
  customSettingWorkDone: boolean;
  customSettingWorkDoneObs: Observable<any>;
  committeeStatus: Array<CommitteeStatus> = [];
  committeeTypes: Array<CommitteeType> = [];
  committeeStatusObs: Observable<CommitteeStatus[]>;
  committeeTypeObs: Observable<CommitteeType[]>;
  currentUrl: string;
  constructor(
    private _crudService: CrudService,
    private route: ActivatedRoute,
    private router: Router,
    private _environmentVariableService: EnvironmentVariableService,
    private _translationService: TranslationService,
    private translate: TranslateService,
    private _uploadService: UploadService,
    private _committeeService: CommitteeService,
  ) {

  }

  ngOnInit() {
    this.getLanguage();
    this.getCommitteeLookups();
    this._committeeService.getRemoveCommitteeCodeFeatureVariable().subscribe(
      res => {
        this.removeCommitteeCode = res.removeCommitteeCodeField;
      }
    );
    this.currentUrl = this.router.url;
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.committeeId = +params['id'];
        this.getCommittee();
      }
    });
  }

  getCommitteeLookups() {
    this.getCommitteeStatues();
    this.getCommitteeTypes();
    this.getAddCommitteeFeatureVariable();
    this.getAddUserFeatureVariable();
    this.getDeleteUserFeatureVariable();
    this.getWorkDoneFeatureVariable();
    forkJoin([this.committeeStatusObs, this.committeeTypeObs, this.customSettingObs,
    this.customSettingDeleteObs, this.addUserFeatureSettingObs, this.customSettingWorkDoneObs])
      .subscribe(([committeeStatusRes, committeeTypesRes, customSettingRes,
        customSettingDeleteRes, addUserFeatureSettingRes, customSettingWorkDoneRes]) => {
        this.committeeStatus = committeeStatusRes;
        this.committeeTypes = committeeTypesRes;
        this.customSetting = customSettingRes.addCommitteeNewFields;
        this.customSettingDelete = customSettingDeleteRes.deleteUserFeature;
        this.addUserFeatureSetting = addUserFeatureSettingRes.addUserFeature;
        this.customSettingWorkDone = customSettingWorkDoneRes.workDoneByCommitteeFeature;

      }
        ,
        error => {
        });

  }

  getDeleteUserFeatureVariable() {
    this.customSettingDeleteObs = this._environmentVariableService.getDeleteUserFeatureVariable();
  }
  getAddUserFeatureVariable() {
    this.addUserFeatureSettingObs = this._environmentVariableService.getAddUserFeatureVariable();
  }

  getWorkDoneFeatureVariable() {
    this.customSettingWorkDoneObs = this._environmentVariableService.getWorkDoneFeatureVariable();
  }

  getCommitteeStatues() {
    this.committeeStatusObs = this._crudService.getList('admin/committee-statuses');
  }
  getCommitteeTypes() {
    this.committeeTypeObs = this._crudService.getList('admin/committee-types');
  }

  getAddCommitteeFeatureVariable() {
    this.customSettingObs = this._environmentVariableService.getAddCommitteeFeatureVariable();
  }

  updateUsersCommitteeCombinedArray() {
    this.usersCommitteeCombinedArray = this.committee.member_users.map(user => ({ ...user, source: 'committeeUser' }))
      .concat(this.committeeUsersRequest.map(item => ({ ...item, source: 'userRequest' })));
  }

  getCommittee() {
    this._crudService.get<Committee>('admin/committees', this.committeeId).subscribe(
      res => {
        this.committee = res['Results'];
        this.committee.isFreezed = Boolean(res['Results'].isFreezed);
        this.formatDate('object');
        this.committee.committee_head = this.committee.committee_head ?? new User();
        this.committee.committee_organiser = this.committee.committee_organiser ?? new User();
        this.committee.committee_responsible = this.committee.committee_responsible ?? new User();
        this.committee?.member_users?.forEach(member => {
          if (member.id === this.committee.committee_head?.id) {
            member.is_head = true;
          }
        });
        if (this.committee?.member_users?.length !== 0) {
          this.memberUserSelectet = true;
        }
        if (this.committee.governance_regulation_url) {
          this.attachmentUrl = this.translate.instant('COMMITTEES.ADD.GOVERNANCE_REGULATION')
            + '.' + this.committee.governance_regulation_url.split('.').pop();
        }
        if (this.committee.decision_document_url) { // new setting
          this.attachmentDecisionUrl = this.translate.instant('COMMITTEES.ADD.DECISIONDOCUMENT')
            + '.' + this.committee.decision_document_url.split('.').pop();
        }
        if (this.addUserFeatureSetting) {
          this.updateUsersCommitteeCombinedArray();
        }
      },
      error => {
      });
  }

  formatDate(type) {
    if (type == 'object') {
      if (this.committee.committee_start_date) {
        const startDate = new Date(this.committee.committee_start_date);
        this.startDateModel = { day: startDate.getDate(), month: startDate.getMonth() + 1, year: startDate.getFullYear() };
      }
      if (this.committee.committee_expired_date) {
        const endDate = new Date(this.committee.committee_expired_date);
        this.expiredDateModel = { day: endDate.getDate(), month: endDate.getMonth() + 1, year: endDate.getFullYear() };
      }
      if (this.committee.decision_date) {
        const decisionDate = new Date(this.committee.decision_date);
        this.decisionDateModel = { day: decisionDate.getDate(), month: decisionDate.getMonth() + 1, year: decisionDate.getFullYear() };
      }
    } else {
      if (this.startDateModel) {
        this.committee.committee_start_date = this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' 00:00:00';
      } else {
        this.committee.committee_start_date = null;
      }
      if (this.expiredDateModel) {
        this.committee.committee_expired_date =
          this.expiredDateModel.year + '-' + this.expiredDateModel.month + '-' + this.expiredDateModel.day + ' 00:00:00';
      } else {
        this.committee.committee_expired_date = null;
      }
      if (this.decisionDateModel) {
        this.committee.decision_date = this.decisionDateModel.year + '-' + this.decisionDateModel.month + '-' + this.decisionDateModel.day + ' 00:00:00';
      } else {
        this.committee.decision_date = null;
      }
    }
  }

  getLanguage() {
    this.isArabic = this._translationService.isArabic();
  }

  redirect() {
    // Extract the base URL
    const baseUrl = this.currentUrl.split('/view')[0];
    this.router.navigateByUrl(baseUrl);
  }

  downloadDecisionDocument() {
    this._uploadService.downloadFile(environment.imagesBaseURL + this.committee.decision_document_url).subscribe((res) => {
      const downloadURL = window.URL.createObjectURL(res);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = this.translate.instant('COMMITTEES.ADD.DECISION_DOCUMENT')
        + '.' + this.committee.decision_document_url.split('.').pop();
      link.click();
    });
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) { return '0 Bytes'; }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = `${(bytes / Math.pow(k, i)).toFixed(dm)}${sizes[i]}`;
    return size;
  }

  downloadFinalOutput() {
    this._committeeService.downloadFinalOutput(this.committeeId).subscribe(
      res => {
        const downloadURL = window.URL.createObjectURL(res);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = (this.isArabic ?
          (this.committee.committee_name_ar ?? this.committee.committee_name_en)
          : (this.committee.committee_name_en ?? this.committee.committee_name_ar)) + '-final-output';
        link.click();
      }
    );
  }

}
