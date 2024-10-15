import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit } from "@angular/core";
import { FilterObject } from "../../../../core/models/filter-object";
import { CommitteeService } from "../../../../core/services/committee/committee.service";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { TranslationService } from "../../../../core/services/translation.service";
import { Committee } from "../../../../core/models/committee";
import { BehaviorSubject, Observable } from "rxjs";
import { Approval } from '../../../../core/models/approval';
import { PagedResult } from "../../../../core/models/paged-result";
import { Right } from "../../../../core/models/enums/rights";
import { RoleService } from "../../../../core/services/security/roles.service";
import { ApprovalStatus } from "../../../../core/models/approval-status";

@Component({
	selector: "m-approval-list-page",
	templateUrl: "./approval-list-page.component.html",
	changeDetection: ChangeDetectionStrategy.Default,
})
export class ApprovalListPageComponent implements OnInit {
	
	// activeIdString: string;
	committees: Array<Committee> = [];
	isCollapsed: boolean = false;
	committeeBindLabel: string = "committee_name_ar";
	statusBindLabel: string = "approval_status_name_ar";
	filterObject = new FilterObject();
	isArabic: boolean;
	loadingSubject = new BehaviorSubject<boolean>(false);
	dataSourceLength: boolean = false;
	paginatorTotal$: Observable<number>;
	dataSource: Array<Approval> = [];
	approvalStatuses: Array<ApprovalStatus> = [];
	addFlag: boolean = false;
	startDateModel;
	endDateModel;

	constructor(
		private _translationService: TranslationService,
		private _crudService: CrudService,
		private _roleService: RoleService,
		private committeeService: CommitteeService
	) {}

	ngOnInit() {
		this.getCommittees();
		this.checkButtonAccess()
		this.getLanguage();
		this.getApprovalStatuses();
		this.filterObject.SearchObject = {};
		this.getList();
	}

	getLanguage() {
		this.isArabic =  this._translationService.isArabic();
		this.committeeBindLabel = this.isArabic?'committee_name_ar' : 'committee_name_en';
		this.statusBindLabel = this.isArabic? 'approval_status_name_ar' : 'approval_status_name_en';
	}

	checkButtonAccess() {
		this.checkAddFlag();
	}

	checkAddFlag(){
		this._roleService.canAccess(Right.addApproval).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}

	getCommittees() {
		this.committeeService.getOrganizationCommittees<Committee>().subscribe(res => {
			this.committees = res;
		}, error => {
		});
	}

	getApprovalStatuses(){
		this._crudService.getList<ApprovalStatus>('admin/approval-statuses').subscribe(res => {
			this.approvalStatuses = res;
		}, error => {
		});
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = 1;
		this.filterObject.SortBy = 'id';
		this.filterObject.SortDirection = 'desc';
		this.dataSourceLength = false;
		
		this._crudService.getPaginatedList<PagedResult>('approvals',this.filterObject).subscribe(res => {
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

	resetSearch() {
		this.filterObject.SearchObject = {};
		this.startDateModel = null;
		this.endDateModel = null;
		this.getList();
	};
}
