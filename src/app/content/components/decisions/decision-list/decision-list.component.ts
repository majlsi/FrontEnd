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
import { Decision } from '../../../../core/models/decision';
import { Right } from '../../../../core/models/enums/rights';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../core/services/translation.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { Tab } from '../../../../core/models/enums/tabs';
import { DecisionType } from '../../../../core/models/decision-type';
import { VoteResultStatuses } from '../../../../core/models/enums/vote-result-statuses';
import { DecisionResultStatuses } from '../../../../core/models/decision-result-statuses';

@Component({
    selector: 'm-decision-list',
    templateUrl: './decision-list.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})

export class DecisionListComponent implements OnInit {

	isCollapsed: boolean = false;
	dataSource: Array<Decision> = [];
	dataSourceLength: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;
	filterObject = new FilterObject();
	displayedColumns = [];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
    isArabic: boolean;
    decisionTypes: Array<DecisionType> = [];
	bindLabel: string = 'decision_type_name_ar';
	tabs = Tab;
	voteResultStatusesEnum = VoteResultStatuses;
	decisionResultStatuses: Array<DecisionResultStatuses> = [];
	decisionResultStatusBindLabel: string = 'vote_result_status_name_ar';

	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private _translationService: TranslationService,
		private roleService: RoleService) { }

	/** LOAD DATA */
	ngOnInit() {
        this.getLanguage();
		this.getDecisionTypes();
		this.getDecicionResultStatuses()
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
		this._crudService.getPaginatedList<PagedResult>('admin/meeting-votes', this.filterObject).
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

	getLanguage() {
        this.isArabic = this._translationService.isArabic();
        if (this.isArabic) {
            this.displayedColumns = ['vote_subject_ar','decision_due_date','decision_type_name_ar','vote_result_status_name_ar','meeting_title_ar','agenda_title_ar','created_at'];
        } else {
            this.bindLabel = 'decision_type_name_en';
            this.displayedColumns = ['vote_subject_en','decision_due_date','decision_type_name_en','vote_result_status_name_en','meeting_title_en','agenda_title_en','created_at'];
		}
		this.decisionResultStatusBindLabel = this.isArabic? 'vote_result_status_name_ar' : 'vote_result_status_name_en';
    }
	
	getDecicionResultStatuses() {
		this._crudService.getList<DecisionResultStatuses>('admin/decision-result-statuses').subscribe(res => {
			this.decisionResultStatuses = res;
		});
	}

    getDecisionTypes(){
        this._crudService.getList<DecisionType>('admin/decision-types').subscribe(res => {
            this.decisionTypes = res;
        }, error => {
        });
    }
}
