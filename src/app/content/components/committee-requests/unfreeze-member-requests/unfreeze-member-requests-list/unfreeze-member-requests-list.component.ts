import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { PagedResult } from '../../../../../core/models/paged-result';
import { BehaviorSubject, Observable, merge, tap } from 'rxjs';
import { CrudService } from '../../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../../core/services/translation.service';
import { environment } from '../../../../../../environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FilterObject } from '../../../../../core/models/filter-object';
import { Router } from '@angular/router';
import { AddUserRequestService } from '../../../../../core/services/request/addUserRequest.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'm-unfreeze-member-requests-list',
  templateUrl: './unfreeze-member-requests-list.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class UnfreezeMemberRequestsListComponent implements OnInit  {
  dataSourceLength: boolean;
	dataSource: Array<any>= [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;
	filterObject = new FilterObject();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
	actions:boolean;
	pageSize = environment.pageSize;
	isArabic: boolean;
	displayedColumns = ['reason','committee_start_date', 'committee_expired_date','status','actions'];
  constructor( private _crudService: CrudService,
		private _translationService: TranslationService,
		private _requestService: AddUserRequestService,
		private translate: TranslateService,
		private router: Router
	){}

    	/** LOAD DATA */
	ngOnInit() {
		this.getLanguage();
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
		this.dataSourceLength = false;
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this. getUnfreezeMemberRequest();
	}

  getUnfreezeMemberRequest() {
		this._crudService.getPaginatedList<PagedResult>('requests/unfreeze-committee-member', this.filterObject).
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

	show(id: any) {
		this.router.navigate(['/committee-requests/unfreeze-requests', id]);
	}

	exportUnfreezeMembersRequests() {
		this._requestService.exportUnfreezeMembersRequestsData().subscribe(
			res => {
					const downloadURL = window.URL.createObjectURL(res);
					const link = document.createElement('a');
					link.href = downloadURL;
					link.download =  this.translate.instant('REQUEST.EXPORT.UNFREEZE_COMMITTEES_REQUESTS') + '.xlsx';
					link.click();
			},
			error => {
	  })
	}
}
