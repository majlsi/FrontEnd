import { Component, ElementRef, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuthNoticeService } from '../../../../core/auth/auth-notice.service';
import { Approval } from '../../../../core/models/approval';
import { User } from '../../../../core/models/user';
import { ApprovalService } from '../../../../core/services/approval/approval.service';
import { UserService } from '../../../../core/services/security/users.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'm-approval-details',
	templateUrl: './approval-details.component.html'
})
export class ApprovalDetailsComponent implements OnInit {
	showRevisionsMenu: boolean = false;
	activeTab: string;
	@ViewChildren('myCanvas', { read: ElementRef }) canvases: QueryList<ElementRef>;
	@ViewChild("content") modalContent: TemplateRef<any>;

	themeName = environment.themeName;
	edit: boolean = false;
	submitted: boolean = false;
	closeResult: string;
	title: string;
	isArabic: boolean;
	approvalId: number;
	approval: any;

	committeeUsers: Array<User> = [];
	dataSource: Array<User> = [];
	dataSourceLength: boolean = true;

	displayedColumns = ['approval_name'];

	isLoaded: boolean = false;

	loaded: boolean = false;
	userObs: Observable<any>;
	user: User;


	constructor(
		public authNoticeService: AuthNoticeService,
		private route: ActivatedRoute,
		private _translationService: TranslationService,
		private _translate: TranslateService,
		private _userService: UserService,
		private _approvalService: ApprovalService,
		private _crudService: CrudService,
	) { }

	ngOnInit(): void {
		this.getLanguage();
		this.route.params.subscribe(params => {
			if (params['id']) {
				this.approvalId = +params['id']; // (+) converts string 'id' to a number
				this._userService.getCurrentUser().subscribe(
					res => {
						this.user = res.user;
						this.getApproval();
					}
				);
			}
		});
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	getApproval() {
		this._crudService.get<Approval>('admin/approvals', this.approvalId).subscribe(res => {
			this.approval = res;
			this.dataSource = res.members;
			if (this.isApprovalCreator()) {
				this.displayedColumns.push('status_id');
				this.displayedColumns.push('updated_at_formatted');
				this.displayedColumns.push('reason');
			}
			if (this.dataSource.length === 0) {
				this.dataSourceLength = true;
			} else {
				this.dataSourceLength = false;
			}
		});
	}

	isApprovalCreator() {
		return this.approval?.created_by == this.user?.id;
	}

	canSign() {
		const currentMember = this.approval?.members.find(item => item.user_id == this.user?.id);
		if (!currentMember) {
			return false;
		}
		if(currentMember.is_signed != null) {
			return false;
		} else {
			return true;
		}
	}

	getSignStatus(member) {
		if (member?.is_signed != null) {
			if (member.is_signed) {
				return this._translate.instant('MEETINGS.PARTICIPANTS.SIGNATURE.SIGNED');
			} else {
				return this._translate.instant('MEETINGS.PARTICIPANTS.SIGNATURE.REFUSED');
			}
		} else {
			return this._translate.instant('MEETINGS.PARTICIPANTS.SIGNATURE.SENT');
		}
	}

	goToDigitalSignature() {
		const lang = this.isArabic ? 'ar' : 'en';
		this._approvalService.loginUserToSignature(this.approvalId).subscribe((response) => {
			if (response.token) {
				window.open(environment.signatureFrontUrl + '?token=' + response.token + '&lang=' + lang + '&timeZone=' + response.timeZone, '_self');
			}
		});
	}

}
