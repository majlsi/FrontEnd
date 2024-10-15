import { environment } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Input } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';

// RXJS
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable, Subject } from 'rxjs';

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
import { CircularDecisionTabs } from '../../../../core/models/enums/circular-decision-tabs';
import { VoteResultStatuses } from '../../../../core/models/enums/vote-result-statuses';
import { Subscription } from 'rxjs';

@Component({
	selector: 'm-circular-decision-list',
	templateUrl: './circular-decision-list.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class CircularDecisionListComponent implements OnInit {

	@Input() dataSourceLength: boolean;
	dataSource: Array<Decision> = [];
	@Input() loadingSubject: BehaviorSubject<boolean>;
	@Input() paginatorTotal$: Observable<number>;

	@Input() filterSubject: Subject<boolean>;
	@Input() filterObject: FilterObject;
	@Input() activeIdString: string;
	@Input() currentTabId: string;
	@Input() vote_schedule_from: any;
	@Input() vote_schedule_to: any;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	isArabic: boolean;
	editFlag: boolean = false;
	deleteFlag: boolean = false;
	displayedColumns = [];
	loading$;
	pageSize = environment.pageSize;
	voteResultStatusesEnum = VoteResultStatuses;
	subscription: Subscription;

	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private _translationService: TranslationService,
		private _roleService: RoleService) { }

	ngOnInit() {
		this.getLanguage();
		this.checkButtonAccess();
	}

	ngAfterViewInit(): void {
		this.subscription = merge(this.sort.sortChange, this.paginator.page, this.filterSubject)
			.pipe(
				tap(() => {
					this.getList();
				})
			)
			.subscribe();
		this.getList();
		this.loading$ = this.loadingSubject.asObservable();
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (this.isArabic) {
			this.displayedColumns = ['vote_subject_ar', 'decision_type_name_ar', 'vote_result_status_name_ar', 'committee_name_ar', 'vote_schedule_from', 'vote_schedule_to', 'actions'];
		} else {
			this.displayedColumns = ['vote_subject_en', 'decision_type_name_en', 'vote_result_status_name_en', 'committee_name_en', 'vote_schedule_from', 'vote_schedule_to', 'actions'];
		}
	}

	checkButtonAccess() {
		this.checkEditFlag();
		this.checkDeleteFlag();
	}

	checkEditFlag() {
		this._roleService.canAccess(Right.EDIT_CIRCULAR_DECISION).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

	checkDeleteFlag() {
		this._roleService.canAccess(Right.DELETE_CIRCULAR_DECISION).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => { });
	}

	getList() {
		if (this.activeIdString == this.currentTabId) {
			this.loadingSubject.next(true);
			this.filterObject.PageNumber = this.paginator.pageIndex + 1;
			this.filterObject.SortBy = this.sort.active;
			this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
			this.dataSourceLength = false;
			if (this.activeIdString == CircularDecisionTabs.allCircularDecisions) {
				delete this.filterObject.SearchObject.is_my_circular_decision;
				delete this.filterObject.SearchObject.is_circular_decision_assign_to_me;
			} else if (this.activeIdString === CircularDecisionTabs.createdByMe) {
				this.filterObject.SearchObject.is_my_circular_decision = true;
				delete this.filterObject.SearchObject.is_circular_decision_assign_to_me;
			} else if (this.activeIdString === CircularDecisionTabs.assignToMe) {
				delete this.filterObject.SearchObject.is_my_circular_decision;
				this.filterObject.SearchObject.is_circular_decision_assign_to_me = true;
			}
			this._crudService.getPaginatedList<PagedResult>('admin/circular-decisions', this.filterObject).subscribe(res => {
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

	}


	edit(decisionId) {
		this.router.navigate(['/circular-decisions/edit', decisionId], { queryParams: { activeTab: this.activeIdString } });
	}

	delete(decisionId) {
		const _title: string = this.translate.instant('CIRCULAR_DECISIONS.DELETE.TITLE');
		const _description: string = this.translate.instant('CIRCULAR_DECISIONS.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('CIRCULAR_DECISIONS.DELETE.WAIT_DESCRIPTION');
		const _deleteMessage = this.translate.instant('CIRCULAR_DECISIONS.DELETE.DELETE_MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<any>('admin/circular-decisions', decisionId).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.paginator.pageIndex = 0;
					this.getList();
				},
					error => {
						this.loadingSubject.next(false);
						this.layoutUtilsService.showActionNotification(this.isArabic ? error.error_ar : error.error, MessageType.Delete);
					});
		});
	}

	viewDecision(decisionId) {
		this.router.navigate(['/circular-decisions/details', decisionId], { queryParams: { activeTab: this.activeIdString } });
	}

	viewDecisionTasks(decisionId) {
		this.router.navigate(['/circular-decisions/tasks', decisionId], { queryParams: { activeTab: this.activeIdString } });
	}
}
