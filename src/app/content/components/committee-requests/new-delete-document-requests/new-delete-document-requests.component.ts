import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable, merge, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { FilterObject } from '../../../../core/models/filter-object';
import { PagedResult } from '../../../../core/models/paged-result';
import { LayoutUtilsService } from '../../../../core/services/layout-utils.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { AddUserRequestService } from '../../../../core/services/request/addUserRequest.service';

@Component({
  selector: 'm-new-delete-document-requests',
  templateUrl: './new-delete-document-requests.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class NewDeleteDocumentRequestsComponent implements OnInit,AfterViewInit{

	dataSource: Array<any> = [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	paginatorTotal$: Observable<number>;
	dataSourceLength: boolean = false;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	filterObject = new FilterObject();

	displayedColumns = ['file_name', 'committee_name','status','actions'];

	pageSize = environment.pageSize;
	isArabic: boolean;

	constructor(
	  private _crudService: CrudService,
	  private router: Router,
	  private _translationService: TranslationService,
	  private _requestService: AddUserRequestService,
	  private layoutUtilsService: LayoutUtilsService,
	  private translate: TranslateService) { }

	ngOnInit(): void {
	  this.isArabic = this._translationService.isArabic();
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
	  this.filterObject.PageNumber = this.paginator?.pageIndex + 1;
	  this.filterObject.SortBy = 'id';
	  this.filterObject.SortDirection = this.sort?.direction ?? 'DESC';
	  this.dataSourceLength = false;

	  this._crudService.getPaginatedList<PagedResult>('requests/delete-file', this.filterObject).
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


	details(id) {
	  this.router.navigate(['/committee-requests/delete-file', id]);
	}

	exportDeletedDocumentsRequests() {
		this._requestService.exportDeleteDocumentsRequestsData().subscribe(
			res => {
					const downloadURL = window.URL.createObjectURL(res);
					const link = document.createElement('a');
					link.href = downloadURL;
					link.download =  this.translate.instant('REQUEST.EXPORT.DELETED_DOCUMENTS_REQUESTS') + '.xlsx';
					link.click();
			},
			error => {
	  })
	}
}
