import { Component, OnInit, ViewChild } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { FilterObject } from '../../../../core/models/filter-object';
import { PagedResult } from '../../../../core/models/paged-result';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, Observable, merge, tap } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'm-committee-remain-percentage',
  templateUrl: './committee-remain-percentage.component.html',
  styleUrls: ['./committee-remain-percentage.component.scss']
})
export class CommitteeRemainPercentageComponent implements OnInit{

	isArabic: boolean;




	committeeRemainPercentageToFinishDatasource:any=[];
	committeeRemainPercentageToFinishDatasourceLength:boolean=false;
	committeeRemainPercentageToFinishDisplayedColumns = ['committee_name_en', 'remain_to_finished'];




	filterObject=new FilterObject();



	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;
	@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
	@ViewChild(MatSort, { static: true }) sort: MatSort;


	pageSize = environment.pageSize;

	constructor(
	  private _crudService: CrudService,
	  private _translationService: TranslationService) { }


	ngOnInit() {
	  this.getLanguage();
	}


	ngAfterViewInit(): void {
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => {
					this.getList();
				})
			)
			.subscribe();
      setTimeout(() => {
        this.getList();
      }, 0);
	}



	getList() {
		this.committeeRemainPercentageToFinishDatasourceLength = false;
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this.getCommitteeRemainPercentage();

	}

	getCommitteeRemainPercentage() {
		this._crudService.getPaginatedList<PagedResult>('admin/organizations/statistics/committee-remain-percentage', this.filterObject).
		subscribe(res => {
			this.loadingSubject.next(false);
			this.paginatorTotal$ = res.TotalRecords;
			this.committeeRemainPercentageToFinishDatasource = res.Results;
			if (this.committeeRemainPercentageToFinishDatasource.length === 0) {
				this.committeeRemainPercentageToFinishDatasourceLength = true;
			}
		},
			error => {
				this.loadingSubject.next(false);
			});
	}



	getLanguage() {
	  this.isArabic = this._translationService.isArabic();
	}



}
