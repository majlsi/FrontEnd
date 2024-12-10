import {MeetingService, TarasulBodyDto} from '../../../../core/services/meeting/meeting.service';
import {Component, Inject, OnInit, Input} from '@angular/core';
import {NgbModal, ModalDismissReasons, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {TranslationService} from '../../../../core/services/translation.service';
import {MeetingAgenda} from '../../../../core/models/meeting-agenda';
import {TranslateService} from '@ngx-translate/core';
import {lookupsAssigtoDept} from '../../../../core/services/tarasul/lookups-assigto_dept';
import {lookupsCabinet} from '../../../../core/services/tarasul/lookups-cabinet';
import {lookupsConfidential} from '../../../../core/services/tarasul/lookups-confidential';
import {lookupsDocSourceType} from '../../../../core/services/tarasul/lookups-doc-source-type';
import {lookupsDocType} from '../../../../core/services/tarasul/lookups-doc-type';
import {lookupsSubjectType} from '../../../../core/services/tarasul/lookups-subject-type';
import {lookupsPriority} from '../../../../core/services/tarasul/lookups-priority';
import {NgForm} from '@angular/forms';


@Component({
	selector: 'm-send-to-tarasul-dialog',
	templateUrl: './send-to-tarasul-dialog.html'
})
export class SendToTarasulDialog implements OnInit {
	submitted: boolean = false;
	edit: boolean = false;
	@Input() meetingId: number;
	@Input() lang: string;
	@Input() is_changed_publish: boolean;
	agendas: Array<MeetingAgenda> = [];
	tarasulBodyForm: TarasulBodyDto = {};
	lookups: {
		lookupsPriority?: any;
		lookupsAssigtoDept?: any;
		lookupsCabinet?: any;
		lookupsConfidential?: any;
		lookupsDocSourceType?: any;
		lookupsDocType?: any;
		lookupsSubjectType?: any;
	} = {};


	constructor(private modalService: NgbModal, private meetingService: MeetingService,
				private _translationService: TranslationService,
				private translate: TranslateService,
				public activeModal: NgbActiveModal,
	) {
	}

	ngOnInit(): void {
		this.lookups = {
			lookupsPriority,
			lookupsAssigtoDept,
			lookupsCabinet,
			lookupsConfidential,
			lookupsDocSourceType,
			lookupsDocType,
			lookupsSubjectType
		};

	}


	save(startMeetingForm: NgForm) {
		debugger
		this.submitted = true;
		this.edit = true;

		if (startMeetingForm.valid) {
			this.meetingService.sendTarasul(this.meetingId, this.lang, this.tarasulBodyForm).subscribe((response) => {
				console.log('sent', response);
				this.submitted = false;

				this.activeModal.close(this.tarasulBodyForm);

			});
		} else {
			this.submitted = false;
		}

	}

	hasError(startMeetingForm: NgForm, field: string, validation: string) {
		return false;
	}


	close() {
		this.submitted = false;
		this.edit = false;
		this.activeModal.dismiss();
	}
}
