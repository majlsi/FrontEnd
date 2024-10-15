import { Component, OnInit, ViewChild, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { PreviousRouteService } from '../../../../core/services/previous.route.service';
import { UserService } from '../../../../core/services/security/users.service';
import { MeetingDataPrepareService } from '../../../../core/services/meeting/meeting-data-prepare.service';

import { Meeting } from '../../../../core/models/meeting';

import { MomTemplate } from '../../../../core/models/mom-template';
import { OrganizationService } from '../../../../core/services/organization/organization.service';



@Component({
    selector: 'm-mom-template-change',
    templateUrl: './mom-template-change.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class MOMTemplateChangeComponent implements OnInit {

    momTemplatelBindLabel = 'template_name_en';
    @Input() meeting = new Meeting();

    meetingId: number;
    @Input() canEditMeeting: boolean;
    @Input() is_mom_sent: boolean;
    isArabic: boolean = false;
    submitted: boolean = false;
    @Output() getMeetingEmitter = new EventEmitter();
    @Input() momTemplates: Array<MomTemplate> = [];


    constructor(
        private route: ActivatedRoute,
        private meetingService: MeetingService,
        private layoutUtilsService: LayoutUtilsService,
        private translate: TranslateService,
        private _translationService: TranslationService,
        private router: Router) {

    }
    ngOnInit() {
        this.getLanguage();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.meetingId = params['id'];
            }

        });
    }


    getLanguage() {
        this.isArabic = this._translationService.isArabic();
        if (this.isArabic === true) {
            this.momTemplatelBindLabel = 'template_name_ar';
        } else {
            this.momTemplatelBindLabel = 'template_name_en';
        }

    }

    changeMomTemplate() {
        this.meetingService.changeMomTemplate(this.meetingId, { 'mom_template_id': this.meeting.meeting_mom_template_id }).subscribe(
            res => {
                if (this.isArabic) {
                    this.layoutUtilsService.showActionNotification(res.message_ar, MessageType.Delete);

                } else {
                    this.layoutUtilsService.showActionNotification(res.message, MessageType.Delete);
                }
                this.getMeetingEmitter.emit();
            },
            error => {
                // console.log('error');
            });
    }

}
