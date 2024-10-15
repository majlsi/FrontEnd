import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'default-add-approval-modal',
  templateUrl: './add-approval-modal.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class AddApprovalModalComponent implements OnInit {

  @Input() meetingId: any;
  @Input() popupApprovalId: any;
  @Input() meetingCommitteeId: any;
  @Input() activeIdString: any;
  @Input() organizers: Array<any> = [];
  constructor(private _translationService: TranslationService, public activeModal: NgbActiveModal) {}

  addMode: boolean = true;

  ngOnInit() {
    if (this.popupApprovalId == null) {
      this.addMode = true;
    } else {
      this.addMode = false;
    }
  }

  dismiss() {
    this.activeModal.dismiss();
  }

  modalTabChange(res) {
    if (res.id != null) {
      this.popupApprovalId = res.id;
    }
    if (res.TabId === 'close') {
      this.activeModal.close();
    }
    if (res.TabId === 'setSignatureAreas') {
      this.addMode = false;
    }
    this.activeIdString = res.TabId;
  }

}
