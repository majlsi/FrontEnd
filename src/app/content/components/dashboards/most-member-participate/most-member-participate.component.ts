import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { FilterObject } from '../../../../core/models/filter-object';
import { PagedResult } from '../../../../core/models/paged-result';
import { environment } from '../../../../../environments/environment';
import { BehaviorSubject, Observable, merge, tap } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'm-most-member-participate',
  templateUrl: './most-member-participate.component.html',
  styleUrls: ['./most-member-participate.component.scss']
})
export class MostMemberParticipateComponent implements OnInit,AfterViewInit{
	isArabic: boolean;

	mostMemberParticipateDatasource:any=[];
	mostMemberParticipateDatasourceLength:boolean=false;
	mostMemberParticipateDisplayedColumns = ['name_ar', 'number_of_committees'];


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
		this.mostMemberParticipateDatasourceLength = false;
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this.getMostMemberParticipate();

	}


	getMostMemberParticipate() {
		this._crudService.getPaginatedList<PagedResult>('admin/organizations/statistics/most-member-participate', this.filterObject).
		subscribe(res => {
			this.loadingSubject.next(false);
			this.paginatorTotal$ = res.TotalRecords;
			this.mostMemberParticipateDatasource = res.Results;
			if (this.mostMemberParticipateDatasource.length === 0) {
				this.mostMemberParticipateDatasourceLength = true;
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
