import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { Component, Inject, OnInit, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

// Services
import { TranslationService } from '../../../../core/services/translation.service';
import { User } from '../../../../core/models/user';
import { VoteResult } from '../../../../core/models/vote-result';
import { environment } from '../../../../../environments/environment';
import { Decision } from '../../../../core/models/decision';
import { VoteResultStatuses } from '../../../../core/models/enums/vote-result-statuses';

@Component({
	selector: 'm-vote-results',
	templateUrl: './vote-results.component.html'
})
export class VoteResultsComponent implements OnInit {
	voteResults: Array<VoteResult> = [];
	voteCounts: any;
	closeResult: string;
	imagesBaseURL = environment.imagesBaseURL;
	@Input() meetingId: number;
	@Input() voteId: number;
	vote: Decision = new Decision();
    voteResultStatusesEnum = VoteResultStatuses;

	displayedColumns = ['name', 'meeting_title', 'meeting_schedule_from', 'meeting_schedule_to'];
	isArabic: boolean;

	constructor(private modalService: NgbModal, private meetingService: MeetingService,
		private _translationService: TranslationService) { }

	ngOnInit() {
	}

	open(content) {
		this.getLanguage();
		this.getvotes();
		this.modalService.open(content, { size: 'xl' as 'lg' }).result.then((result) => {
			this.closeResult = `Closed with: ${result}`;
		}, (reason) => {
			this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
		});
	}

	private getDismissReason(reason: any): string {
		if (reason === ModalDismissReasons.ESC) {
			return 'by pressing ESC';
		} else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
			return 'by clicking on a backdrop';
		} else {
			return `with: ${reason}`;
		}
	}

	getvotes() {
		this.meetingService.getVoteResults<any>(this.meetingId, this.voteId).subscribe(res => {
			this.voteResults = res.results;
			this.voteCounts = res.count[0];
			this.vote = res.vote;
		}, error => {

		});
	}


	close() {
		this.voteResults = [];
		this.voteCounts = {};
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

}
