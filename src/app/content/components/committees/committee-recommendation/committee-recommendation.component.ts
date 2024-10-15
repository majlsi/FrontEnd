import { Component, ElementRef, HostListener, Input, OnInit, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Committee } from '../../../../core/models/committee';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { UserService } from '../../../../core/services/security/users.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';

@Component({
  selector: 'default-committee-recommendation',
  templateUrl: './committee-recommendation.component.html',
  styleUrls: []
})
export class CommitteeRecommendationComponent implements OnInit {
  submitted: boolean = false;
  edit: boolean = false;
  closeResult: string;
  @Input() committee: Committee;
  @Input() recommend: any;
  newRecommendations: Array<any> = [];
  recommendationStatues: Array<any> = [];
  participants: Array<any> = [];
  isArabic: boolean = false;

  constructor(
    private _ngbActiveModal: NgbActiveModal,
    private _committeeService: CommitteeService,
    private _crudService: CrudService,
    private _layoutUtilsService: LayoutUtilsService,
    private _userService: UserService,
    private _translationService: TranslationService,
  ) { }

  ngOnInit(): void {
    this.isArabic = this._translationService.isArabic();
    this._crudService.getList<any>('admin/recommendation-status').subscribe(
      res => {
        this.recommendationStatues = res;
      }
    );
    if (this.recommend != null) {
      this.addNewRow(this.recommend);
      this.formatDate('object', this.recommend, 0);
    } else {
      this.addNewRow(null);
    }
    this._userService.getOrganizationUsersStakeholders({ name: '', include_stakeholders: false }).subscribe(
      res => {
        this.participants = res;
      }, err => {

      }
    );
  }

  save(finalOutputForm: NgForm) {
    this.submitted = true;
    this.edit = true;
    if (finalOutputForm.valid) {
      this.addFinalOutputFile();
    } else {
      this.submitted = false;
    }
  }

  addFinalOutputFile() {
    this.newRecommendations.forEach((recommendation, index) => { this.formatDate('string', recommendation, index); });
    this.committee.newRecommendations = this.newRecommendations;
    this._committeeService.addCommitteeRecommendations(this.committee, this.committee.id).subscribe(
      res => {
        this.close(res);
      }, err => {
        this.submitted = false;
        this._layoutUtilsService.showActionNotification(
          this.isArabic ? 'حدث خطأ فى اضافة التوصيه' : 'Failed to add recommendations',
          MessageType.Create
        );
      }
    );
  }

  addNewRow(recommend) {
    if (recommend == null) {
      recommend = {
        recommendation_body: null, recommendation_date: null,
        responsible_user: null, responsible_party: null, recommendationDateModel: null,
        committee_final_output_id: null, recommendation_status_id: null
      };
    }
    this.newRecommendations.push(recommend);
  }

  deleteRow(index) {
    if (index >= 0 && index < this.newRecommendations.length && this.newRecommendations.length > 1) {
      this.newRecommendations.splice(index, 1);
    }
  }

  editRecommend(finalOutputForm) {
    this.submitted = true;
    this.edit = true;
    if (finalOutputForm.valid) {
      this.formatDate('string', this.recommend, 0);
      this._crudService.edit('admin/recommendations', this.recommend, this.recommend.id).subscribe(
        res => {
          this.close(res);
        }, err => {
          this.submitted = false;
          this._layoutUtilsService.showActionNotification(
            this.isArabic ? 'حدث خطأ فى تعديل التوصيه' : 'Failed to update recommendations',
            MessageType.Create
          );
        }
      );
    } else {
      this.submitted = false;
    }
  }

  close(res) {
    this.submitted = false;
    this.edit = false;
    this._ngbActiveModal.close(res);
  }

  dismiss() {
    this.submitted = false;
    this.edit = false;
    this._ngbActiveModal.dismiss();
  }

  hasError(committeeForm: NgForm, field: string, validation: string) {
    if (committeeForm && Object.keys(committeeForm.form.controls).length > 0 &&
      committeeForm.form.controls[field].errors && validation in committeeForm.form.controls[field].errors) {
      if (validation) {
        return (committeeForm.form.controls[field].dirty &&
          committeeForm.form.controls[field].errors[validation]) || (this.edit && committeeForm.form.controls[field].errors[validation]);
      }
      return (committeeForm.form.controls[field].dirty &&
        committeeForm.form.controls[field].invalid) || (this.edit && committeeForm.form.controls[field].invalid);
    }
  }

  formatDate(type, obj, index) {
    if (type === 'object') {
      if (obj.recommendation_date) {
        const recommendationDate = new Date(obj.recommendation_date);
        obj.recommendationDateModel = {
          day: recommendationDate.getDate(), month: recommendationDate.getMonth() + 1, year: recommendationDate.getFullYear()
        };
      }
    } else {
      if (this.newRecommendations[index].recommendationDateModel) {
        obj.recommendation_date = this.newRecommendations[index].recommendationDateModel.year
          + '-' + this.newRecommendations[index].recommendationDateModel.month + '-'
          + this.newRecommendations[index].recommendationDateModel.day + ' 00:00:00';
      } else {
        obj.recommendation_date = null;
      }
    }
  }

  getParticipantsLabel(participant: any) {
    let name = '';
    if (!participant?.meeting_guest_id && participant.id) {
      // user
      const index = this.participants.findIndex(p => p.id === participant.id && !p.isGuest);
      if (index > -1) {
        const selected = this.participants[index];
        name = (this.isArabic ? (selected.name_ar ? selected.name_ar : selected.name) :
          (selected.name ? selected.name : selected.name_ar));
      }
    } else if (participant?.meeting_guest_id && !participant.id) {
      // Guest
      const index = this.participants.findIndex(p => p.meeting_guest_id === participant.meeting_guest_id && p.isGuest);
      if (index > -1) {
        name = this.participants[index]?.email;
      }
    }
    return name;
  }

  getParticipantValue(participant: any) {
    const value = participant.name ? participant.name : participant.name_ar;
    return value;
  }

  clearDate(index) {
    this.newRecommendations[index].recommendationDateModel = null;
  }

  decideClosure(event, datepicker) {
    const path = event.composedPath().map(p => p.localName);
    if (!path.includes('ngb-datepicker')) {
      datepicker.close();
    }
  }

}
