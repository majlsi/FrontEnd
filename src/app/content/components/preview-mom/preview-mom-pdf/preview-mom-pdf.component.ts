import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// Services
import { DomSanitizer } from '@angular/platform-browser';
import { Meeting } from '../../../../core/models/meeting';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';

// Models

@Component({
    selector: 'm-preview-mom-pdf',
    templateUrl: './preview-mom-pdf.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class PreviewMomPdfComponent implements OnInit {

    pdfSrc: any;
    submitted: boolean = false;
    meetingId: number;
    isArabic: boolean = false;
    meeting = new Meeting();
    hideLoader: boolean = false;

    constructor(private _crudService: CrudService,
        private route: ActivatedRoute,
        private layoutUtilsService: LayoutUtilsService,
        private meetingService: MeetingService,
        private sanitizer: DomSanitizer,
        private location: Location,
        private translationService: TranslationService,
        private translate: TranslateService) {

    }

    ngOnInit() {
        this.isArabic = this.translationService.isArabic();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.meetingId = +params['id'];
                this.getMeetingData();
            }
        });
    }

    getMeetingData() {
        this._crudService.get<Meeting>('admin/meetings-versions', this.meetingId).subscribe(res => {
            this.meeting = res;
            this.getMomPdf();
        },
            error => {

            });
    }

    getMomPdf() {
        const langId = this.isArabic ? 1 : 2;
        this.meetingService.previewMom(this.meetingId, langId).subscribe((result) => {
            const blob = new Blob([result], { type: 'application/pdf' });
            const downloadURL = window.URL.createObjectURL(blob);
            this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl(downloadURL);
            this.hideLoader = true;
        }, error => {
            this.submitted = false;
            this.hideLoader = true;
            this.layoutUtilsService.showActionNotification(this.translate.instant('MEETINGS.MOM.PREVIEW.ERROR'), MessageType.Delete);
        });

    }

    back() {
        this.location.back();
    }


    sendMom() {
        this.submitted = true;
        const _title: string = this.translate.instant('MEETINGS.STATUSACTIONS.SENDEMAIL.TITLE');
        const _description: string = this.translate.instant('MEETINGS.STATUSACTIONS.SENDEMAIL.DESCRIPTION');
        const _waitDesciption: string = this.translate.instant('MEETINGS.STATUSACTIONS.SENDEMAIL.WAITDESCRIPTION');
        const _successMessage = this.translate.instant('MEETINGS.STATUSACTIONS.SENDEMAIL.SUCCESSMESSAGE');

        const dialogRef = this.layoutUtilsService.meeingActions
            (_title, _description, _waitDesciption, this.translate.instant('BUTTON.SEND'));
        dialogRef.afterClosed().subscribe(res => {
            if (!res) {
                this.submitted = false;
                return;
            }
            this.meetingService.sendEmailAfterEndMeeting(this.meetingId).
                subscribe(pagedData => {
                    this.submitted = false;
                    this.getMeetingData();
                    this.location.back();
                    this.layoutUtilsService.showActionNotification(_successMessage, MessageType.Delete);
                },
                    error => {
                        this.submitted = false;
                        this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Delete);
                    });
        });
    }


}
