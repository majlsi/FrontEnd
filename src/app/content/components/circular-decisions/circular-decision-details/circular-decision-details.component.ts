import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "../../../../../environments/environment";
import { VoteStatuses } from "../../../../core/models/enums/vote-statuses";
import { LayoutUtilsService, MessageType } from "../../../../core/services/layout-utils.service";
import { UserService } from "../../../../core/services/security/users.service";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { UploadService } from "../../../../core/services/shared/upload.service";
import { TranslationService } from "../../../../core/services/translation.service";
import { Decision } from "../../../../core/models/decision";
import { VoteResultStatuses } from "../../../../core/models/enums/vote-result-statuses";
import { DatePipe } from "@angular/common";
import { DecisionService } from "../../../../core/services/decision/decision.service";
import { Observable, forkJoin } from "rxjs";
import { NotificationModelTypes } from "../../../../core/models/enums/notification-model-types";
import { NotificationService } from "../../../../core/services/notification/notification.service";
import { UserSignature } from "../../../../core/models/user-signature";
import { SignatureModalComponent } from "../../meeting-minutes/signature-modal/signature-modal.component";
import { CommentModalComponent } from "../../meeting-minutes/comment-modal/comment-modal.component";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { DocumentField } from "../../../../core/models/document-field";
import { DocumentPage } from "../../../../core/models/document-page";
import { SignatureService } from "../../../../core/services/decision/signature.service";

@Component({
	selector: "m-circular-decision-details",
	templateUrl: "./circular-decision-details.component.html",
	styleUrls: ["./circular-decision-details.component.scss"],
})
export class CirculatDecisionDetailsComponent implements OnInit {

	decisionId: number;
	decision: Decision = new Decision();
	imagesBaseURL = environment.imagesBaseURL;
	isArabic: boolean = false;
	voteResultStatusesEnum = VoteResultStatuses;
	createdDate: string;
	dueDate: string;
	voteStatuses = VoteStatuses;
	voteStatusId: number;
	userId: number;
	userObs: Observable<any>;
	documentObs: Observable<any>;
	selctedVoteStatusId: number;

	slideWidth = 50;
	collapsed: boolean = false;
	signHidden: boolean = true;
	userToken: string;
	isLoaded: boolean = false;
	lastElementIndex: number;
	documentPages: Array<DocumentPage> = [];
	modifiedDocumentFields: Array<DocumentField>;

	constructor(private crudService: CrudService,
		private route: ActivatedRoute,
		private router: Router,
		private translate: TranslateService,
		private translationService: TranslationService,
		private userService: UserService,
		private uploadService: UploadService,
		private datePipe: DatePipe,
		private modalService: NgbModal,
		private decisionService: DecisionService,
		private _signatureService: SignatureService,
		private layoutUtilsService: LayoutUtilsService,
		private notificationService: NotificationService) { }

	ngOnInit() {
		this.getLanguage();
		this.listenToCircularDecisionChanged();
		this.getCurrentUser();
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.decisionId = +params['id']; // (+) converts string 'id' to a number
				this.getDocumentPages();
			}
			forkJoin([this.userObs])
				.subscribe(data => {
					this.userId = data[0].user.id;
					if (params['id']) {
						forkJoin([this.documentObs]).subscribe(res => {
							this.documentPages = res[0].Results;
							this.getDecision();
						});
					}
				});
		});
	}

	getDecision() {
		this.crudService.get<Decision>('admin/circular-decisions', this.decisionId).subscribe(res => {
			this.decision = res;
			this.setVoteStatus();
			this.renderCreatedDate();
			this.renderDueDate();

		});
	}

	getDocumentPages() {
		const lang = this.isArabic ? 'ar' : 'en';
		this.documentObs = this._signatureService.getDocumentPagesList(lang, this.decisionId);

	}

	getLanguage() {
		this.isArabic = this.translationService.isArabic();
	}

	getCurrentUser() {
		this.userObs = this.userService.getCurrentUser();
	}

	setVoteStatus() {
		this.decision.voters.forEach(voter => {
			if (voter.id == this.userId) {
				this.voteStatusId = voter.vote_status_id;
			}
		});
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
		} else if (['doc', 'docx', 'txt', 'odt'].includes(extention)) {
			return 'doc';
		} else if (['avi', 'mov', 'mp4', 'wmv'].includes(extention)) {
			return 'video';
		} else if (['ppt', 'pptx'].includes(extention)) {
			return 'ppt';
		} else if (['xls', 'xlsx'].includes(extention)) {
			return 'xls';
		}
	}

	changeVoteStatus(statusId: number) {
		this.selctedVoteStatusId= statusId;
		if (this.voteStatusId != statusId) {
			let documentField = null;
			this.documentPages.filter(item => item.DocumentFields.filter(function (itm) {
				if (itm.DocumentFieldHtml.includes("#signBtns")) {
					documentField = itm;
				}
			}));
			this.open(documentField);

		}
	}

	sign() {
		const lang = this.isArabic ? 'ar' : 'en';
		this.decisionService.loginUserToVoteSignature(this.decisionId).subscribe((response) => {
			if (response.token) {
				window.open(environment.signatureFrontUrl + '?token=' + response.token + '&lang=' + lang, '_self');
			}
		});
	}

	renderCreatedDate() {

		if (this.decision.creation_same_day) {
			if (this.decision.creation_hour_diff > 0) {
				this.createdDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.ABOUT') + this.decision.creation_hour_diff +
					this.translate.instant('CIRCULAR_DECISIONS.DETAILS.HOURS');
			} else {
				this.createdDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.ABOUT') + this.decision.creation_minute_diff +
					this.translate.instant('CIRCULAR_DECISIONS.DETAILS.MINUTES');
			}
		} else {
			this.createdDate = this.datePipe.transform(this.decision.creation_date, "d MMMM y, hh:mm a");
		}
	}

	renderDueDate() {
		if (this.decision.show_due_date) {

			if (this.decision.due_months > 0) {
				this.dueDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.IN') + this.decision.due_months +
					this.translate.instant('CIRCULAR_DECISIONS.DETAILS.MONTHS');
			} else if (this.decision.due_days > 0) {
				this.dueDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.IN') + this.decision.due_days +
					this.translate.instant('CIRCULAR_DECISIONS.DETAILS.DAYS');
			} else if (this.decision.due_hours > 0) {
				this.dueDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.IN') + this.decision.due_hours +
					this.translate.instant('CIRCULAR_DECISIONS.DETAILS.HOURS');
			} else if (this.decision.due_minutes > 0) {
				this.dueDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.IN') + this.decision.due_minutes +
					this.translate.instant('CIRCULAR_DECISIONS.DETAILS.MINUTES');
			}
		} else {
			this.dueDate = this.translate.instant('CIRCULAR_DECISIONS.DETAILS.IN') + '0' +
				this.translate.instant('CIRCULAR_DECISIONS.DETAILS.DAYS');
		}
	}

	listenToCircularDecisionChanged() {
		this.notificationService.notificationData.subscribe(res => {
			if (res.notificationModelId == this.decisionId && res.notificationModelType == NotificationModelTypes.circularDecision) {
				this.getDecision();
			}
		});
	}

	//sign from mjlsi

	open(documentfield: DocumentField) {
		const signModelRef: NgbModalRef = this.modalService.open(SignatureModalComponent, { centered: true, size: "lg", backdrop: "static", keyboard: false });
		(<SignatureModalComponent>signModelRef.componentInstance).documentFieldId = documentfield.DocumentFieldID;
		signModelRef.componentInstance.lang = this.isArabic ? 'ar' : 'en';
		signModelRef.componentInstance.decisionId = this.decisionId;
		signModelRef.result.then((res) => {

			if (res == 'Go to SignatureModal') {
				this.open(documentfield);
			} else if (res != 'Close click') {
				documentfield.DocumentFieldComment = res.signObj.DocumentFieldComment;
				documentfield.DocumentFieldValue = res.signObj.DocumentFieldValue;
				documentfield.SignatureTypeID = res.signObj.SignatureTypeID;
				documentfield.DocumentFieldHtml = `<div style="text-align:center;width:37.5%;position: absolute;top:` +
					(documentfield.YPosition) + `%;left:` + (documentfield.XPosition) +
					`% "> <img width="37.5%" onclick="document.getElementById('signatureButton_` + documentfield.DocumentFieldID + `').click()"  src="` + res.signObj.DocumentFieldValue + `"></div>`;
				documentfield.isModified = 1;

				if (res.saveSignature == true) {
					this.saveSignature(documentfield.DocumentFieldValue);
				}
				this.saveAndExit();
			}
		});
	}

	openComment(documentfield: DocumentField) {
		const rejectModelRef: NgbModalRef = this.modalService.open(CommentModalComponent, { centered: true, backdrop: "static", keyboard: false });
		rejectModelRef.componentInstance.lang = this.isArabic ? 'ar' : 'en';
		rejectModelRef.componentInstance.decisionId = this.decisionId;
		(<CommentModalComponent>rejectModelRef.componentInstance).documentFieldId = documentfield.DocumentFieldID;

		rejectModelRef.result.then((result) => {
			if (result == 'Go to SignatureModal') {
				this.openComment(documentfield);
			} else if (result != 'Close click') {
				documentfield.DocumentFieldValue = 'false';
				documentfield.DocumentFieldComment = result;
				documentfield.DocumentFieldHtml = `<h4 class="m--font-danger"  onclick="document.getElementById('rejectButton_` + documentfield.DocumentFieldID + `').click()"    style="position: absolute;top:` + (documentfield.YPosition + 1) + `%;left:` + (documentfield.XPosition + 15) + `% ">` + this.translate.instant('SIGNATURE.REFUSE_COMMENT') + ` </h4>`;
				documentfield.isModified = 1;
				this.saveAndExit();
			}
		});
	}

	saveSignature(sugnatureValue) {

		this.crudService.add<UserSignature>('admin/signatures', { SignatureValue: sugnatureValue }).subscribe(res => {

		},
			error => {

			});

	}



	scroll(id: string) {

		const el: HTMLElement = document.getElementById(id);
		el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });;
	}


	saveAndExit() {
		this.documentPages.forEach((documentPage, index) => {
			this.modifiedDocumentFields = [];
			this.modifiedDocumentFields = documentPage.DocumentFields.filter(item => item.isModified === 1);
			if (this.modifiedDocumentFields.length == 0 && index == this.documentPages.length - 1) {
				return;
			}
			this.modifiedDocumentFields.forEach((modifiedDocumentField, fieldIndex) => {

				if (modifiedDocumentField.DocumentFieldValue == 'false') {// rejected field
					if (modifiedDocumentField.DocumentFieldComment == undefined) {
						modifiedDocumentField.DocumentFieldComment = null;
					}
					this._signatureService.reject(modifiedDocumentField.DocumentFieldID, { DocumentFieldComment: modifiedDocumentField.DocumentFieldComment }, this.decisionId).
						subscribe(res => {
							this.decision.is_signed =true;
							this.updateVoteStatus();
						},
							error => {


							});
				} else {// signature image field
					this._signatureService.sign(modifiedDocumentField.DocumentFieldID, { DocumentFieldValue: modifiedDocumentField.DocumentFieldValue, DocumentFieldComment: modifiedDocumentField.DocumentFieldComment, SignatureTypeID: modifiedDocumentField.SignatureTypeID }, this.decisionId).
						subscribe(res => {
							this.decision.is_signed =true;
							this.updateVoteStatus();
						},
							error => {


							});

				}
			});

		});

	}
	updateVoteStatus() {
		if (this.selctedVoteStatusId === VoteStatuses.YES) {
			this.decisionService.changeCircularDecisionResultToYes(this.decision.id).subscribe(() => {

			});
		} else if (this.selctedVoteStatusId === VoteStatuses.NO) {
			this.decisionService.changeCircularDecisionResultToNo(this.decision.id).subscribe(() => {

			});
		} else if (this.selctedVoteStatusId === VoteStatuses.MAYATTEND) {
			this.decisionService.changeCircularDecisionResultToAbstained(this.decision.id).subscribe(() => {

			});
		}
	}

	downloadDecisionPdf() {
		const langId = this.isArabic ? 1 : 2;
		this.decisionService.downloadDecisionPdf(this.decisionId, langId).subscribe((result) => {
			const downloadURL = window.URL.createObjectURL(result);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download =
				(this.isArabic ? (this.decision.vote_subject_ar ? this.decision.vote_subject_ar : this.decision.vote_subject_en) : (this.decision.vote_subject_en ? this.decision.vote_subject_en : this.decision.vote_subject_ar)) + '.pdf';
			link.click();
		}, error => {
			this.layoutUtilsService.showActionNotification(this.translate.instant('CIRCULAR_DECISIONS.PREVIEW.ERROR'), MessageType.Delete);
		});
	}

}
