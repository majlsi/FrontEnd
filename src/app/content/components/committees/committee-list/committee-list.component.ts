import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {NgbNavChangeEvent} from '@ng-bootstrap/ng-bootstrap';

// RXJS
import { tap, finalize } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';

// Models
import { FilterObject } from '../../../../core/models/filter-object';
import { Committee } from '../../../../core/models/committee';
import { PagedResult } from '../../../../core/models/paged-result';
import { Right } from '../../../../core/models/enums/rights';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { environment } from './../../../../../environments/environment';
import { TranslationService } from '../../../../core/services/translation.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { CommitteeTabs } from '../../../../core/models/enums/committee-tabs';
import { CommitteeService } from '../../../../core/services/committee/committee.service';

@Component({
	selector: 'm-committee-list',
	templateUrl: './committee-list.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class CommitteeListComponent implements OnInit,AfterViewInit {

	dataSource: Array<Committee> = [];
	activeIdString: string;
	committees: Array<Committee> = [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	isCollapsed: boolean = false;
	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;
	dataSourceLength: boolean = false;
	removeCommitteeCode: boolean = false;

	filterObject = new FilterObject();
	submitted: boolean = false;

	displayedColumns = ['committee_name_en', 'committee_name_ar', 'committee_code', 'name', 'committeee_members_count', 'actions'];

	pageSize = environment.pageSize;
	isArabic: boolean;
	addFlag: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;
	canExport: boolean = false;

	constructor(private route: ActivatedRoute,
		private _crudService: CrudService,
		private _committeeService: CommitteeService,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		private roleService: RoleService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.getLanguage();
		this.checkButtonAccess();
		this._committeeService.getRemoveCommitteeCodeFeatureVariable().subscribe(
			res => {
				this.removeCommitteeCode = res.removeCommitteeCodeField;
			}
		);
		this.activeIdString = CommitteeTabs.CURRENTCOMMITTEES;
		this.filterObject.SearchObject = {};
		// this.getRoles();
	}

	ngAfterViewInit(): void {
		/* Data load will be triggered in two cases:
		- when a pagination event occurs => this.paginator.page
		- when a sort event occurs => this.sort.sortChange
		**/

		this.getList();
	}



	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = 1;
		this.filterObject.SortBy = 'id';
		this.filterObject.SortDirection = 'desc';
		this.dataSourceLength = false;



		if (this.activeIdString === CommitteeTabs.CURRENTCOMMITTEES) {
			this.getCurrentCommittees();
		} else if (this.activeIdString === CommitteeTabs.PENDINGCOMMITTEES) {
			this.getPendingCommittees();
		}

	}
	getPendingCommittees() {
		this._crudService.getPaginatedList<PagedResult>('committee-requests', this.filterObject).
		subscribe(res => {
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
	getCurrentCommittees() {
		this._crudService.getPaginatedList<PagedResult>('admin/committees', this.filterObject).
		subscribe(res => {
			this.loadingSubject.next(false);
			this.paginatorTotal$ = res.Results['TotalRecords'];
			this.dataSource = res.Results['Results'];
			this.canExport = res['CanExport'];
			if (this.dataSource.length === 0) {
				this.dataSourceLength = true;
			}
		},
			error => {
				this.loadingSubject.next(false);
			});
	}


	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
	};


	beforeChange($event: NgbNavChangeEvent) {
		this.activeIdString = $event.nextId;
		this.getList();
	}




	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	checkButtonAccess() {
		this.checkAddFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
	}

	checkAddFlag() {
		this.roleService.canAccess(Right.ADDNEWCOMMITTEE).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}

	checkEditFlag() {
		this.roleService.canAccess(Right.COMMITTEEEDIT).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

	checkDeleteFlag() {
		this.roleService.canAccess(Right.DELETE_COMMITTEE).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => { });
	}
	
	exportCommittees() {
		this._committeeService.exportAllCommitteesData().subscribe(
		
			res => {
					const downloadURL = window.URL.createObjectURL(res);
					const link = document.createElement('a');
					link.href = downloadURL;
					link.download =  `all_committees.xlsx`;
					link.click();
			},
			error => {
		  	}
		)

	  }
}
