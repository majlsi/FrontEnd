import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { MeetingService } from '../../../../core/services/meeting/meeting.service';
import { AddApprovalModalComponent } from '../add-approval-modal/add-approval-modal.component';
import { TranslateService } from '@ngx-translate/core';
import { ApprovalStatusesEnum } from '../../../../core/models/enums/approval-statuses';

@Component({
	selector: 'm-meeting-approval-tab',
	templateUrl: './meeting-approval-tab.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class MeetingApprovalTabComponent implements OnInit {

	submitted: boolean = false;
	@Input() canEditMeeting: boolean;
	@Input() approvals: Array<any>;
	@Input() meetingCommitteeId: number;
	@Input() meetingId: number;
	@Input() organizers: number;
	@Output() modalTabChange = new EventEmitter();
	@Output() getMeetingEmitter = new EventEmitter();
	approvalStatusEnum = ApprovalStatusesEnum;

	constructor(
		private _meetingService: MeetingService,
		private layoutUtilsService: LayoutUtilsService,
		private modalService: NgbModal,
		private translate: TranslateService
	) { }

	ngOnInit() { }

	addNewApproval() {
		const modalRef = this.modalService.open(AddApprovalModalComponent, {
			centered: true,
			size: 'full-width',
		});
		modalRef.componentInstance.meetingId = this.meetingId;
		modalRef.componentInstance.organizers = this.organizers;
		modalRef.componentInstance.activeIdString = 'approvalInfo';
		modalRef.componentInstance.meetingCommitteeId = this.meetingCommitteeId;

		modalRef.closed.subscribe(() => {
			this.getMeetingEmitter.emit();
		});

		modalRef.dismissed.subscribe(() => {
			this.getMeetingEmitter.emit();
		});
	}

	editApproval(approvalId) {
		const modalRef = this.modalService.open(AddApprovalModalComponent, {
			centered: true,
			size: 'lg',
		});
		modalRef.componentInstance.meetingId = this.meetingId;
		modalRef.componentInstance.organizers = this.organizers;
		modalRef.componentInstance.popupApprovalId = approvalId;
		modalRef.componentInstance.meetingCommitteeId = this.meetingCommitteeId;

		modalRef.closed.subscribe(() => {
			this.getMeetingEmitter.emit();
		});

		modalRef.dismissed.subscribe(() => {
			this.getMeetingEmitter.emit();
		});
	}

	deleteApproval(approvalId) {
		const _title: string = this.translate.instant('APPROVAL.DELETE.TITLE');
		const _description: string = this.translate.instant('APPROVAL.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('APPROVAL.DELETE.WAIT_DESCRIPTION');
		const _deleteMessage = this.translate.instant('APPROVAL.DELETE.DELETE_MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._meetingService.deleteApprovalFromMeeting(this.meetingId, approvalId).subscribe(
				result => {
					this.getMeetingEmitter.emit();
				},
				err => {
					this.layoutUtilsService.showActionNotification(err.error, MessageType.Create);
				}
			);
		});
	}
}
