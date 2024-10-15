import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { VoteStatuses } from "../../../../core/models/enums/vote-statuses";
import { User } from "../../../../core/models/user";
import { VoteStatus } from "../../../../core/models/vote-status";
import { LayoutUtilsService } from "../../../../core/services/layout-utils.service";
import { UserService } from "../../../../core/services/security/users.service";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { UploadService } from "../../../../core/services/shared/upload.service";
import { TranslationService } from "../../../../core/services/translation.service";

@Component({
	selector: "m-decision-details",
	templateUrl: "./decision-details.component.html",
	styleUrls: ["./decision-details.component.scss"],
})
export class DecisionDetailsComponent implements OnInit {
	imagesBaseURL = environment.imagesBaseURL;
	decisionStatuses = DecisionStatuses;
	isArabic: boolean = false;
	lang: string;
	currentUser: User;
	currentUserObs: Observable<any>;
	@Input() voteStatuses: Array<VoteStatus> = [];
	voteStatusEnum = VoteStatuses;


	decision = {
		id: 950,
		decision_title_ar: null,
		decision_title_en: "trrrrr",
		decision_status_id: 1,
		decision_status_name_ar: "مصدق عليه",
		decision_status_name_en: "Approved",
		decision_type_id: 1,
		decision_due_date: "2020-11-19 00:00:00",
		created_at: "2020-11-19 09:02:50",
		is_voted_now: 1,
		yes_votes: 1,
		no_votes: 1,
		abstained_votes: 1,
		decision_results: [{
				id: 112,
				meeting_id: 950,
				vote_id: 333,
				user_id: 60,
				vote_status_id: 3,
				created_at: "2020-11-19 09:08:17",
				updated_at: "2020-11-19 09:08:17",
				deleted_at: null
		}],
	};

	meeting = {
		id: 950,
		meeting_title_ar: null,
		meeting_title_en: "trrrrr",
		meeting_code: "12-test -191120-001",
		meeting_sequence: 1,
		related_meeting_id: null,
		version_number: null,
		is_published: 0,
		meeting_type_id: 8,
		committee_id: 93,
		time_zone_id: 1,
		proposal_id: 1,
		meeting_online_config_id: null,
		online_configuration_id: 2,
		created_by: 60,
		meeting_description_ar: null,
		meeting_description_en: "mmmmmmmm",
		meeting_note_ar: null,
		meeting_note_en: null,
		meeting_venue_ar: null,
		meeting_venue_en: "rrr",
		meeting_status_id: 3,
		document_id: null,
		is_signature_sent: 0,
		is_mom_sent: 0,
		meeting_mom_template_id: 3,
		organization_id: 3,
		meeting_schedule_from: "2020-11-19 00:00:00",
		meeting_schedule_to: "2020-11-20 19:00:00",
		location_lat: "24.774265",
		location_long: "46.738586",

		agendaAttachments: [true],
		meeting_attachments: [
			{
				id: 1624,
				attachment_name: "1.png",
				attachment_url: "uploads/attachments/1605776553_1.png",
				meeting_id: null,
				mom_id: null,
				presenter_id: 60,
				presentation_notes: null,
				meeting_agenda_id: 819,
				created_at: "2020-11-19 09:02:50",
				updated_at: "2020-11-19 09:03:04",
				deleted_at: null,
				can_end: true,
				can_present: true,
			},
			{
				id: 1625,
				attachment_name: "1.png",
				attachment_url: "uploads/attachments/1605776553_1.png",
				meeting_id: null,
				mom_id: null,
				presenter_id: 60,
				presentation_notes: null,
				meeting_agenda_id: 819,
				created_at: "2020-11-19 09:02:50",
				updated_at: "2020-11-19 09:03:04",
				deleted_at: null,
				can_end: true,
				can_present: true,
			},
		],
	};


	constructor(private crudService: CrudService,
		private route: ActivatedRoute,
		private router: Router,
		private translate: TranslateService,
		private translationService: TranslationService,
		private userService: UserService,
		private uploadService: UploadService,
		private layoutUtilsService: LayoutUtilsService) {}

	ngOnInit() {
		this.getCurrentUser();
		this.getLanguage();
	}

	getCurrentUser() {
		this.currentUserObs = this.userService.getCurrentUser();
	}

	getLanguage() {
		this.isArabic = this.translationService.isArabic();
		if (this.isArabic === true) {
			this.lang = 'ar';
		} else {
			this.lang = 'en';
		}
	}


	downloadFile(url: string, name: string) {
		this.uploadService.downloadFile(url).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = name;
			link.click();
		});
	}


	checkFileType(url: string) {
		let extention = url.split('.').pop();
		if (extention) {
			extention = extention.toLowerCase();
		}
		if (['jpeg', 'jpg', 'png'].includes(extention)) {
			return 'image';
		} else if (extention === 'pdf') {
			return 'pdf';
		} else if (['doc', 'docx'].includes(extention)) {
			return 'doc';
		} else if (['avi', 'mov', 'mp4', 'wmv'].includes(extention)) {
			return 'video';
		} else if (['ppt', 'pptx'].includes(extention)) {
			return 'ppt';
		} else if (['xls', 'xlsx'].includes(extention)) {
			return 'xls';
		}
	}

	changeVoteStatus(voteResult: any, statusId: number, voteId: number) {
		if (statusId === VoteStatuses.YES) {

		} else if (statusId === VoteStatuses.NO) {

		} else if (statusId === VoteStatuses.MAYATTEND) {

		}

	}

}


export enum DecisionStatuses {
	APPROVED = 1,
	REJECTED = 2
}
