import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { forkJoin, Observable, BehaviorSubject, merge } from 'rxjs';

// services
import { CrudService } from '../../../../core/services/shared/crud.service';

// models
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { FilterObject } from '../../../../core/models/filter-object';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from '../../../../../environments/environment';
import { FailedLoginAttempt } from '../../../../core/models/failed-login-attempts';
import { tap } from 'rxjs/operators';
import { PagedResult } from '../../../../core/models/paged-result';
import { RoleService } from '../../../../core/services/security/roles.service';
import { Right } from '../../../../core/models/enums/rights';

@Component({
    selector: 'm-blocked-users-list',
    templateUrl: './blocked-users-list.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class BlockedUsersListComponent implements OnInit, AfterViewInit {

    isArabic: boolean = false;
    isCollapsed: boolean = false;
	dataSource: Array<FailedLoginAttempt> = [];
	dataSourceLength: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject = new FilterObject();

	displayedColumns = ['ip_address', 'email_address', 'failed_login_date','name', 'actions'];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	deleteFlag: boolean = false;

    constructor(private route: ActivatedRoute, 
        private _crudService: CrudService,
        private router: Router,
        private _translationService: TranslationService,
        private layoutUtilsService: LayoutUtilsService,
        private translate: TranslateService,
        private roleService: RoleService) {
        this.filterObject.SearchObject = {};
    }

    ngOnInit() {
        this.checkButtonAccess();
        this.getLanguage();
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
		this._crudService.getPaginatedList<PagedResult>('failed-login-attempts', this.filterObject).
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
    
    resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
    };
    
    checkButtonAccess(){
		this.checkDeleteAttemptFlag();
    }
    
    checkDeleteAttemptFlag(){
        this.roleService.canAccess(Right.DELETE_ATTEMPT).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => {});
    }

    getLanguage() {
        this.isArabic = this._translationService.isArabic();
    }

    delete(id: any) {
		const _title: string = this.translate.instant('BLOCKED_USERS.DELETE.DELETE_ATTEMPT');
		const _description: string = this.translate.instant('BLOCKED_USERS.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('BLOCKED_USERS.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('BLOCKED_USERS.DELETE.DELETE_MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<FailedLoginAttempt>('failed-login-attempts', id).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.paginator.pageIndex = 0;
					this.getList();
				},
					error => {
						this.loadingSubject.next(false);
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(error.error_ar, MessageType.Delete);

						} else {
							this.layoutUtilsService.showActionNotification(error.error, MessageType.Delete);

						}
					});
		});
	}
}
