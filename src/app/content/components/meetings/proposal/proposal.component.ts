
import {Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, ViewChild, Input} from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';

// Models
import { Proposal } from '../../../../core/models/proposal';
import { environment } from '../../../../../environments/environment';

// Services
import { CrudService } from '../../../../core/services/shared/crud.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
	selector: 'm-proposal',
	templateUrl: './proposal.component.html',
	changeDetection: ChangeDetectionStrategy.Default
 })
 export class ProposalComponent implements OnInit {

	meetingId: number;
	isArabic: boolean = false;
	proposals: Array<Proposal> = [];
	imagesBaseURL = environment.imagesBaseURL;

	@Input() canEditMeeting: boolean;

    constructor(private _crudService: CrudService,
		private route: ActivatedRoute, private router: Router,
		private _translationService: TranslationService,
        private _meetingService: MeetingService) {
    }

	ngOnInit() {
		this.getLanguage();
        this.route.params.subscribe(params => {
            if (params['id']) {
				this.meetingId = +params['id'];
				this.getproposals();
            }
        });
    }

	getproposals() {
		this._meetingService.getMeetingProposals<Proposal[]>(this.meetingId).subscribe(res => {
			this.proposals = res;
		}, error => {

		});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}
}
