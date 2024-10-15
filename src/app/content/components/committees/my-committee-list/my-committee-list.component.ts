import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CrudService } from '../../../../core/services/shared/crud.service';

// RXJS
import { BehaviorSubject, Observable } from 'rxjs';

// Models
import { Committee } from '../../../../core/models/committee';
import { Right } from '../../../../core/models/enums/rights';
import { FilterObject } from '../../../../core/models/filter-object';
import { PagedResult } from '../../../../core/models/paged-result';

// Material

import { environment } from '../../../../../environments/environment';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { LayoutUtilsService } from '../../../../core/services/layout-utils.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
	selector: 'm-my-committee-list',
	templateUrl: './my-committee-list.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class MyCommitteeListComponent implements OnInit, AfterViewInit {

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
		this.filterObject.SearchObject = {};
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
		this._crudService.getPaginatedList<PagedResult>('admin/my-committees', this.filterObject).
			subscribe(res => {
				this.loadingSubject.next(false);
				this.paginatorTotal$ = res.Results['TotalRecords'];
				this.dataSource = res.Results['Results'];
				this.canExport = res['CanExport'];
				if (this.dataSource.length === 0) {
					this.dataSourceLength = true;
				}
			}, error => {
				this.loadingSubject.next(false);
			}
			);
	}

	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
	};

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
		this._committeeService.exportMyCommitteesData().subscribe(

			res => {
				const downloadURL = window.URL.createObjectURL(res);
				const link = document.createElement('a');
				link.href = downloadURL;
				link.download = `my_committees.xlsx`;
				link.click();
			},
			error => {
			}
		);

	}
}
