import {Component, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { DecisionType } from '../../../../core/models/decision-type';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { FilterObject } from '../../../../core/models/filter-object';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslationService } from '../../../../core/services/translation.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { TranslateService } from '@ngx-translate/core';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Right } from '../../../../core/models/enums/rights';
import { tap } from 'rxjs/operators';
import { PagedResult } from '../../../../core/models/paged-result';

@Component({
   selector: 'm-decision-type-list',
   templateUrl: './decision-type-list.component.html',
   changeDetection: ChangeDetectionStrategy.Default
})
export class DecisionTypeListComponent implements OnInit {

    isCollapsed: boolean = false;
	dataSource: Array<DecisionType> = [];
	dataSourceLength: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject = new FilterObject();

	displayedColumns = ['decision_type_name_ar', 'decision_type_name_en', 'actions'];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	isArabic: boolean;
	addFlag: boolean = false;
	editFlag: boolean = false;
    deleteFlag: boolean = false;
    
    constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private _translationService: TranslationService,
		private roleService: RoleService) {
    }

	ngOnInit() {
        this.getLanguage();
		this.checkButtonAccess();
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
		this._crudService.getPaginatedList<PagedResult>('admin/decision-types', this.filterObject).
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

    getLanguage() {
		this.isArabic = this._translationService.isArabic();
    }
    
    checkButtonAccess(){
		this.checkAddFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
    }
    
    checkAddFlag(){
		this.roleService.canAccess(Right.ADD_DECISION_TYPE).subscribe(res => {
				if (res.canAccess === 1) {
					this.addFlag = true;
				}
			}, error => {});
	}

	checkEditFlag(){
		this.roleService.canAccess(Right.EDIT_DECISION_TYPE).subscribe(res => {
				if (res.canAccess === 1) {
					this.editFlag = true;
				}
			}, error => {});
	}

	checkDeleteFlag(){
		this.roleService.canAccess(Right.DELETE_DECISION_TYPE).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => {});
    }
    
    edit(id: any) {
        this.router.navigate(['/decision-types/edit', id]);
    }

    resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
    };
    
    delete(id: any) {
		const _title: string = this.translate.instant('DECISION_TYPES.DELETE.TITLE');
		const _description: string = this.translate.instant('DECISION_TYPES.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('DECISION_TYPES.DELETE.WAIT_DESCRIPTION');
		const _deleteMessage = this.translate.instant('DECISION_TYPES.DELETE.DELETE_MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<DecisionType>('admin/decision-types', id).
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
