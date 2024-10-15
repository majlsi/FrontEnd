import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, merge, tap } from 'rxjs';
import { Committee } from '../../../../../core/models/committee';
import { FilterObject } from '../../../../../core/models/filter-object';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from '../../../../../../environments/environment';
import { CrudService } from '../../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../../core/services/translation.service';
import { PagedResult } from '../../../../../core/models/paged-result';
import { Router } from '@angular/router';

@Component({
  selector: 'm-temporary-committee-list',
  templateUrl: './temporary-committee-list.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class TemporaryCommitteeListComponent implements OnInit,AfterViewInit {
	dataSourceLength: boolean;
	dataSource: Array<Committee>= [];
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
	displayedColumns = ['committee_name_en','committee_status_name_en', 'name','committee_start_date', 'committee_expired_date','committeee_members_count'];
	constructor(private _crudService: CrudService,	
		private router: Router,
		private _translationService: TranslationService,
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
      setTimeout(() => {
        this.getList();
      }, 0);
 
	}

	getList() {
		this.dataSourceLength = false;
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this.getTemporaryCommittees();

	}
	getTemporaryCommittees() {
		this._crudService.getPaginatedList<PagedResult>('admin/committees/temporary-committees', this.filterObject).
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

	viewCommittee(id) {
		this.router.navigate(['/temporary-committee/view/', id]);
	}

}
