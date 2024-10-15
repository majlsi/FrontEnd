import { environment } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// RXJS
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';

// Models
import { FilterObject } from '../../../../core/models/filter-object';
import { Role } from '../../../../core/models/role';
import { PagedResult } from '../../../../core/models/paged-result';
import { Right } from '../../../../core/models/enums/rights';


// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { RoleService } from '../../../../core/services/security/roles.service';
@Component({
	selector: 'm-role-list',
	templateUrl: './role-list.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class RoleListComponent implements OnInit {

	isCollapsed: boolean = false;
	dataSource: Array<Role> = [];
	dataSourceLength: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject = new FilterObject();

	displayedColumns = ['role_name_ar', 'role_name', 'actions'];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	addFlag: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;

	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private roleService: RoleService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.filterObject.SearchObject = {};
		this.checkButtonAccess();
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
		this._crudService.getPaginatedList<PagedResult>('roles', this.filterObject).
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


	edit(id: any) {
		this.router.navigate(['/roles/edit', id]);
	}

	delete(id: any) {
		const _title: string = this.translate.instant('ROLES.DELETE.DELETEROLE');
		const _description: string = this.translate.instant('ROLES.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('ROLES.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('ROLES.DELETE.DELETEMESSAGE');
		const _deleteErrorMessage = this.translate.instant('ROLES.DELETE.DELETE_ERROR_MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<Role>('roles', id).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.paginator.pageIndex = 0;
					this.getList();
				},
					error => {
						this.layoutUtilsService.showActionNotification(_deleteErrorMessage, MessageType.Delete);
						this.loadingSubject.next(false);
					});
		});
	}

	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
	};

	checkButtonAccess() {
		this.checkAddFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
	}

	checkAddFlag() {
		this.roleService.canAccess(Right.ROLESADD).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}

	checkEditFlag() {
		this.roleService.canAccess(Right.ROLESEDIT).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

	checkDeleteFlag() {
		this.roleService.canAccess(Right.DELETE_ROLE).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => { });
	}
}
