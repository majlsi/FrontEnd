import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { StakeholderService } from '../../../../core/services/stakeholder/stakeholder.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'm-import-stakeholders',
  templateUrl: './import-stakeholders.component.html',
})
export class ImportStakeholdersComponent implements OnInit {

  spinnerFlag: boolean = false;
  displayedColumns = ["name", "email", "date_of_birth", "identity_number", "share", "status"]
  @Input() dataSource;
  stakeholdersList = [];
  successCount: number = 0;
  failedCount: number = 0;
  errors: Array<any> = [];
  isArabic: boolean = true;
  showError: boolean = false;
  constructor(
    private activeModal: NgbActiveModal,
    private stakeholderService: StakeholderService,
    private _translationService: TranslationService,
    private translate: TranslateService,
    private layoutUtilsService: LayoutUtilsService
  ) { }

  ngOnInit(): void {
    this.isArabic = this._translationService.isArabic();
    this.successCount = this.dataSource.filter(
      (x) => x.status === true
    ).length;
    this.failedCount = this.dataSource.filter(
      (x) => x.status === false
    ).length;
  }

  close() {
    this.activeModal.close();
  }

  confirm() {
    this.showError = false;
    this.spinnerFlag = true;
    this.stakeholdersList = this.dataSource.filter(
      (x) => x.status === true
    )
    if (this.stakeholdersList.length > 0) {
      this.stakeholderService
        .AddBulkStakeholdersFromExcel(this.stakeholdersList)
        .subscribe(
          (res) => {
            this.activeModal.close()
            this.layoutUtilsService
            .showActionNotification(this.translate.instant("STAKEHOLDER.IMPORT.IMPORTED_SUCCESSFULLY"));
          },
          (err) => {
            this.showError = true;
            this.spinnerFlag = false;
            this.errors = err.error[0];
          }
        );
    } else {
      this.showError = true;
      this.errors = [];
      this.errors = [{
        'message_ar': "يجب ان يكون عدد المساهمين الصالحين أكبر من 0",
        'message': "Success Stakeholders must be greater than 0"
      }];
      this.spinnerFlag = false;
    }
  }
}
