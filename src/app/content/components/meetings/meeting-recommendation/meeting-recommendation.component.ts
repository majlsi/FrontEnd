import { Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
// Models
import { MeetingRecommendation } from '../../../../core/models/MeetingRecommendation';
// Services
import { TranslationService } from '../../../../core/services/translation.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { DragulaService } from 'ng2-dragula';
import { MeetingStatuses } from '../../../../core/models/enums/meeting-statuses';
import { User } from '../../../../core/models/user';
import { CrudService } from '../../../../core/services/shared/crud.service';

@Component({
  selector: 'm-meeting-recommendation',
  templateUrl: './meeting-recommendation.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class MeetingRecommendationComponent implements OnInit, OnDestroy{
  edit: boolean = false;
  submitted: boolean = false;

  @Input() canEditMeeting: boolean;
	@Input() meetingId: number;
  @Input() recommendations: Array<MeetingRecommendation> = [];
  @Input() meetingStatusId: number;
  @Input() participants: Array<User> = [];
  meetingStatuses = MeetingStatuses;
  isArabic: boolean = false;
  recommendationDateModel: any;
  errors: Array<String> = [];
    recommendationStatues: Array<any> = [];
  @Output() tabChanged: EventEmitter<string> = new EventEmitter();
  @Output() getMeetingEmitter = new EventEmitter();
  @Output() updateRecommendationsEmitter = new EventEmitter();
  constructor(
      private route: ActivatedRoute, private router: Router,
      private _translationService: TranslationService,
      private _meetingService: MeetingService,
      private _crudService: CrudService,
      private translate: TranslateService,
      private layoutUtilsService: LayoutUtilsService,
      private dragula: DragulaService) {
  }
  ngOnDestroy(): void {
      this.dragula.destroy('recommendation');
  }


  ngOnInit() {
      this.getLanguage();
      this._crudService.getList<any>('admin/recommendation-status').subscribe(
          res => {
              this.recommendationStatues = res;
          }
      );
      this.route.params.subscribe(params => {
          if (params['id']) {
              this.meetingId = +params['id'];
              this.formatDate('object');
          }
          if (this.canEditMeeting === false) {
         this.dragula.createGroup('recommendation', {
            moves: (el, container, handle, sibling) => false
        });
    }
      });
  }
  
  hasError(recommendationForm: NgForm, field: string, validation: string) {
      if (recommendationForm && Object.keys(recommendationForm.form.controls).length > 0 && recommendationForm.form.controls[field] &&
          recommendationForm.form.controls[field].errors && validation in recommendationForm.form.controls[field].errors) {
          if (validation) {
              return (recommendationForm.form.controls[field].dirty &&
                  recommendationForm.form.controls[field].errors[validation]) || (this.edit && recommendationForm.form.controls[field].errors[validation]);
          }
          return (recommendationForm.form.controls[field].dirty &&
              recommendationForm.form.controls[field].invalid) || (this.edit && recommendationForm.form.controls[field].invalid);
      }
  }

  removeRecommendation(recommendationIndex) {
      const _title: string = this.translate.instant('MEETINGS.RECOMMENDATION.DELETE.DELETERECOMMENDATION');
      const _description: string = this.translate.instant('MEETINGS.RECOMMENDATION.DELETE.DESCRIPTION');
      const _waitDesciption: string = this.translate.instant('MEETINGS.RECOMMENDATION.DELETE.WAITDESCRIPTION');
      const _deleteMessage = this.translate.instant('MEETINGS.RECOMMENDATION.DELETE.DELETEMESSAGE');
      const _errorMessage = this.translate.instant('MEETINGS.RECOMMENDATION.DELETE.ERRORMESSAGE');

      const dialogRef = this.layoutUtilsService.deleteElement(_title, _description,
          _waitDesciption, this.translate.instant('BUTTON.DELETE'));
      dialogRef.afterClosed().subscribe(res => {
          if (!res) {
              return;
          }
          if (this.recommendations[recommendationIndex].id > 0) {
              this._meetingService.deleteMeetingRecommendation<MeetingRecommendation>(this.meetingId, this.recommendations[recommendationIndex].id).
                  subscribe(pagedData => {
                      this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
                      this.recommendations.splice(recommendationIndex, 1);
                  },
                      error => {
                          if (this.isArabic) {
                              this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);
                          } else {
                              this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);
                          }
                      });
          } else {
              this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
              this.recommendations.splice(recommendationIndex, 1);
          }
          this.updateRecommendationsEmitter.emit();
      });
  }

  save(recommendationForm: NgForm, previewMeeting: boolean = false) {
      this.submitted = true;
      this.edit = true;
      this.errors = [];
      if (recommendationForm.valid ) {
          if (this.meetingId) { // if edit
              this.recommendations.forEach((recommendation, index) => {
                  if (recommendation.id < 0) {
                    recommendation.id = undefined;
                  }
              });
                    this.formatDate('string');
                    this.updateRecommendations(previewMeeting);
              }
      } else {
          this.submitted = false;
      }

  }

  updateRecommendations(previewMeeting) {
      this._meetingService.setMeetingRecommendationsForMeeting<any>(this.meetingId, this.recommendations).subscribe(res => {
          this.submitted = false;
          this.getMeetingEmitter.emit();
          if (previewMeeting) {
              // redirect to preview meeting
              this.router.navigate(['/preview-meetings/' + res.meeting_version_id]);
          } else {
          }
      },
          error => {
              this.submitted = false;
              this.errors = error.error[0];
          });
  }

  appendNewRecommendation () {
      const newRecommendation = new MeetingRecommendation();
      newRecommendation.meeting_id = this.meetingId;
      newRecommendation.recommendation_text ='';
      newRecommendation.responsible_user = null;
      newRecommendation.responsible_party = '';
      newRecommendation.recommendation_date = '';
      this.recommendations.push(newRecommendation);
  }
  getLanguage() {
      this.isArabic = this._translationService.isArabic();
  }
  trackFunction(index: number, item: MeetingRecommendation) {
      return item.id;
  }

  redirect() {
      this.router.navigate(['/meetings']);
  }

  saveMeetingVersion(recommendationForm: NgForm) {
      // save meeting agendas
      this.save(recommendationForm, true);
  }
formatDate(type) {
    this.recommendations.forEach((recommendation, index) => {
      if (type == 'object') {
        if (recommendation.recommendation_date) {
          const recommendationDate = new Date(recommendation.recommendation_date);
            this.recommendations[index].recommendationDateModel = { day: recommendationDate.getDate(), month: recommendationDate.getMonth() + 1, year: recommendationDate.getFullYear() };
        }
      }
      else {
          if (recommendation.recommendationDateModel) {
              this.recommendations[index].recommendation_date = recommendation.recommendationDateModel.year + '-' + recommendation.recommendationDateModel.month + '-' + recommendation.recommendationDateModel.day + ' 00:00:00';
        } else {
          this.recommendations[index].recommendation_date = null;
        }
      }
  });
}

getParticipantsLabel(participant: any) {
  let name = '';
  if (!participant?.meeting_guest_id && participant.id) {
      // user
      let index = this.participants.findIndex(p => p.id == participant.id && !p.isGuest)
      if(index > -1){
          let selected = this.participants[index]
          name = (this.isArabic ? (selected.name_ar ? selected.name_ar : selected.name) :
              (selected.name ? selected.name : selected.name_ar))
      }
  } else if (participant?.meeting_guest_id && !participant.id) {
      // Guest
      let index = this.participants.findIndex(p => p.meeting_guest_id == participant.meeting_guest_id && p.isGuest)
      if(index > -1){
          name = this.participants[index]?.email;
      }
  }
  return name;
}

getParticipantValue(participant:any) {
  let value = participant.name ? participant.name : participant.name_ar
  return value;
}

addNewTag = (term: string) => term;
} 
