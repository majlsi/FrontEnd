import { environment } from '../../../../../environments/environment';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';

// RXJS
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';

// Models
import { FilterObject } from '../../../../core/models/filter-object';
import { PagedResult } from '../../../../core/models/paged-result';
import { MeetingType } from '../../../../core/models/meeting-type';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../../../core/services/security/users.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Right } from '../../../../core/models/enums/rights';

@Component({
	selector: 'm-proposal-list',
	templateUrl: './proposal-list.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class ProposalListComponent implements OnInit {

	isCollapsed: boolean = false;
	dataSource: Array<MeetingType> = [];
	dataSourceLength: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject = new FilterObject();

	displayedColumns = ['proposal_title', 'created_by', 'created_at', 'actions'];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	organizationUsers: any;
	isArabic: any;
	bindLabel: string;
	addFlag: boolean = false;
	editFlag: boolean = false;


	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private _userService: UserService,
		private roleService: RoleService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.checkButtonAccess();
		this.getLanguage();
		this.getOrganizationUsers();
		this.filterObject.SearchObject = {};
	}

	ngAfterViewInit(): void {
		/* Data load will be triggered in two cases:
	- when a pagination event occurs => this.paginator.page
	- when a sort event occurs => this.sort.sortChange
	**/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.getList();
				})
			)
			.subscribe();
		this.getList();
	}


	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.dataSourceLength = false;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this._crudService.getPaginatedList<PagedResult>('admin/proposals', this.filterObject).
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


	show(id: any) {
		this.router.navigate(['/proposals/view', id]);
	}


	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic === true) {
			this.bindLabel = 'name_ar';
		} else {
			this.bindLabel = 'name';
		}
	}
	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
	};

	getOrganizationUsers() {
		return this._userService.getOrganizationUsers().
			subscribe(res => {
				this.organizationUsers = res;
				// console.log(this.organizationUsers);
			},
				error => {
					this.loadingSubject.next(false);
				});
	}

	checkButtonAccess() {
		this.checkAddFlag();
		this.checkEditFlag();
	}

	checkAddFlag() {
		this.roleService.canAccess(Right.ADDPROPOSAL).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}

	checkEditFlag() {
		this.roleService.canAccess(Right.PROPOSALDETAILS).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

}
