import { environment } from './../../../../../environments/environment';
import {Component, OnInit, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';

// RXJS
import { tap } from 'rxjs/operators';
import { merge , BehaviorSubject , Observable} from 'rxjs';

// Models
import { FilterObject } from '../../../../core/models/filter-object';
import { PagedResult } from '../../../../core/models/paged-result';
import { MeetingType } from '../../../../core/models/meeting-type';
import { Right } from '../../../../core/models/enums/rights';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { RoleService } from '../../../../core/services/security/roles.service';

@Component({
    selector: 'm-meeting-type-list',
    templateUrl: './meeting-type-list.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})

export class MeetingTypeListComponent implements OnInit {

	isCollapsed: boolean = false;
	dataSource: Array<MeetingType> = [];
	dataSourceLength: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject = new FilterObject();

	displayedColumns = ['meeting_type_name_ar', 'meeting_type_name_en', 'actions'];

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
		private roleService: RoleService) { }

	/** LOAD DATA */
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
		this._crudService.getPaginatedList<PagedResult>('admin/meeting-types', this.filterObject).
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
        this.router.navigate(['/meeting-types/edit', id]);
    }

	delete(id: any) {
		const _title: string = this.translate.instant('MEETINGTYPES.DELETE.DELETEMEETINGTYPE');
		const _description: string = this.translate.instant('MEETINGTYPES.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('MEETINGTYPES.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('MEETINGTYPES.DELETE.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<MeetingType>('admin/meeting-types', id).
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

	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
	};

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	checkButtonAccess(){
		this.checkAddFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
	}

	checkAddFlag(){
		this.roleService.canAccess(Right.ADDNEWMEETINGTYPE).subscribe(res => {
				if (res.canAccess === 1) {
					this.addFlag = true;
				}
			}, error => {});
	}

	checkEditFlag(){
		this.roleService.canAccess(Right.EDITMEETINGTYPE).subscribe(res => {
				if (res.canAccess === 1) {
					this.editFlag = true;
				}
			}, error => {});
	}

	checkDeleteFlag(){
		this.roleService.canAccess(Right.DELETE_MEETING_TYPE).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => {});
	}
}
