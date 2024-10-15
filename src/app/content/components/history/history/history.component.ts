import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subject, debounceTime, distinctUntilChanged, merge, switchMap, tap } from 'rxjs';
import { Committee } from '../../../../core/models/committee';
import { FilterObject } from '../../../../core/models/filter-object';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { environment } from '../../../../../environments/environment';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { PagedResult } from '../../../../core/models/paged-result';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/security/users.service';
import { AuditEvents } from '../../../../core/models/audit-events';
import { AuditModels } from '../../../../core/models/audit-models';
@Component({
  selector: 'm-history',
  templateUrl: './history.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class HistoryComponent implements OnInit,AfterViewInit {
	dataSourceLength: boolean;
	dataSource: Array<Committee>= [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
  isCollapsed: boolean = false;
	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;
	filterObject = new FilterObject();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
	actions:boolean;
	pageSize = environment.pageSize;
	isArabic: boolean;
	displayedColumns = ['user_id','event', 'auditable_type','history_variable','created_at'];
  events: any[] = AuditEvents;
  models: any[] = AuditModels;
  focus$ = new Subject<string>();
	click$ = new Subject<string>();
	constructor(private _crudService: CrudService,	
		private router: Router,
    private _userService: UserService,
		private _translationService: TranslationService,
	){}

    	/** LOAD DATA */
	ngOnInit() {
		this.getLanguage();
    //this.getTemporaryCommittees();
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
		this.getHistory();

	}
	getHistory() {
		this._crudService.getPaginatedList<PagedResult>('admin/history', this.filterObject).
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

  resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
	};

	search = (text$: Observable<string>) =>
		text$.pipe(
			debounceTime(300),
			distinctUntilChanged(),
			switchMap(term => term === '' ? []
				: this._userService.getMatchedOrganizationUsers({ name: term })
			)
		)
    formatter = (user: any) => {
      if (this.isArabic === true) {
        return user.name_ar || user.name;
      } else {
        return user.name || user.name_ar;
      }
    }

  getSearchForUsers(userName) {
		let user_name = '';
		if (typeof (userName) === 'string') {
			user_name = userName;
    }
  }
}

