import { ChangeDetectionStrategy, Component, OnInit, Input, ViewChild } from "@angular/core";
import { Observable, BehaviorSubject, merge } from "rxjs";
import { FilterObject } from "../../../../core/models/filter-object";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslationService } from "../../../../core/services/translation.service";
import { environment } from "../../../../../environments/environment";
import { tap } from "rxjs/operators";
import { PagedResult } from "../../../../core/models/paged-result";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { ApprovalStatusesEnum } from "../../../../core/models/enums/approval-statuses";
import { ApprovalStatus } from "../../../../core/models/approval-status";
import { Approval } from "../../../../core/models/approval";
import { RoleService } from "../../../../core/services/security/roles.service";
import { Right } from "../../../../core/models/enums/rights";
import { LayoutUtilsService, MessageType } from "../../../../core/services/layout-utils.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { ApprovalService } from "../../../../core/services/approval/approval.service";
import { UserService } from "../../../../core/services/security/users.service";

@Component({
	selector: "m-approval-list",
	templateUrl: "./approval-list.component.html",
	changeDetection: ChangeDetectionStrategy.Default,
})
export class ApprovalListComponent implements OnInit {

	@Input() dataSourceLength: boolean;
	@Input() dataSource: Array<Approval>;
	@Input() loadingSubject: BehaviorSubject<boolean>;
	@Input() paginatorTotal$: Observable<number>;
	@Input() filterObject: FilterObject;
	@Input() approvalStatuses: Array<ApprovalStatus>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	approvalStatusEnum = ApprovalStatusesEnum
	isArabic: boolean;
	displayedColumns = ["approval_title", "status_id",
		"created_at_formatted", "updated_at_formatted", "actions",];
	loading$;
	pageSize = environment.pageSize;
	addFlag: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;
	user: any;

	constructor(private router: Router, private _translationService: TranslationService,
		private _crudService: CrudService,
		private _userService: UserService,
		private _roleService: RoleService,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService,
		private approvalService: ApprovalService
		) {}

	ngOnInit() {
		this.getLanguage();
		this.checkAddFlag();
		this._userService.getCurrentUser().subscribe(
			res => {
				this.user = res.user;
			}
		);
	}

	ngAfterViewInit(): void {
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.getList();
				})
			)
			.subscribe();
			this.getList();
	}


	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.SearchObject = { includeMeetingApprovals: false };
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.SortDirection =
			this.sort.direction !== "" ? this.sort.direction : "DESC";
		this.dataSourceLength = false;
		this._crudService.getPaginatedList<PagedResult>('admin/approvals',this.filterObject).subscribe(res => {
			this.loadingSubject.next(false);
			this.paginatorTotal$ = res.TotalRecords;
	 		this.dataSource = res.Results;
	 		if (this.dataSource.length === 0) {
		 		this.dataSourceLength = true;
		 	}
		 	},
		error => {
			this.loadingSubject.next(false);
		});
	}

	checkButtonAccess() {
		this.checkAddFlag();
		
		this.checkEditFlag();
		this.checkDeleteFlag();
	}

	checkAddFlag() {
		this._roleService.canAccess(Right.addApproval).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}
	checkEditFlag() {
		this._roleService.canAccess(Right.EDITAPPROVAL).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

	checkDeleteFlag() {
		this._roleService.canAccess(Right.DELETEAPPROVAL).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => { });
	}


	resetSearch = function () {
		this.filterObject.SearchObject = { includeMeetingApprovals: false };
		this.getList();
	};

	edit(id: any) {
		this.router.navigate(['/approvals/edit', id]);
	}

	delete(id) {
		const _title: string = this.translate.instant('APPROVAL.DELETE.TITLE');
		const _description: string = this.translate.instant('APPROVAL.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('APPROVAL.DELETE.WAIT_DESCRIPTION');
		const _deleteMessage = this.translate.instant('APPROVAL.DELETE.DELETE_MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<Document>('admin/approvals', id).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.paginator.pageIndex = 0;
					this.getList();
				},
					error => {
						this.loadingSubject.next(false);
						this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Delete);
					});
		});
	}

	reviewRoom(approval) {
		// console.log(approval);
		this.router.navigate(['/approvals/details', approval.id]);
	}

	downloadApproval(id, title) {
		this.approvalService.downloadApprovalPdf(id).subscribe((response) => {
			const downloadURL = window.URL.createObjectURL(response);
			const link = document.createElement('a');
			link.href = downloadURL;
			link.download = title + '.pdf';
			link.click();
		}, async err => {
			let error;
			await err.text().then(text => {
				error = JSON.parse(text);
			});

			const errMsg = this.isArabic ? (error.error[0]).error_ar : (error.error[0]).error;
			this.layoutUtilsService.showActionNotification(errMsg, MessageType.Create);
		});
	}
}
