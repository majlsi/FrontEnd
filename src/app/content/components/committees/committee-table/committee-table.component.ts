


import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit, Input, SimpleChanges } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {NgbNavChangeEvent} from '@ng-bootstrap/ng-bootstrap';

// RXJS
import { tap, finalize } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';

// Models
import { FilterObject } from '../../../../core/models/filter-object';
import { Committee } from '../../../../core/models/committee';
import { PagedResult } from '../../../../core/models/paged-result';
import { Right } from '../../../../core/models/enums/rights';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { environment } from './../../../../../environments/environment';
import { TranslationService } from '../../../../core/services/translation.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { CommitteeTabs } from '../../../../core/models/enums/committee-tabs';
import { CommitteeService } from '../../../../core/services/committee/committee.service';
import { AdminRequest } from '../../../../core/models/admin-request';

@Component({
  selector: 'm-committee-table',
  templateUrl: './committee-table.component.html',
  styleUrls: ['./committee-table.component.scss']
})
export class CommitteeTableComponent implements OnInit,AfterViewInit {

	@Input() dataSourceLength: boolean;
	@Input() dataSource: Array<Committee>;


	@Input() loadingSubject: BehaviorSubject<boolean>;
	loading$;

	// Paginator | Paginators count
	@Input()paginatorTotal$: Observable<number>;

	@Input() filterObject: FilterObject;

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	@Input() activeIdString: string;

	@Input() actions:boolean;

	pageSize = environment.pageSize;
	isArabic: boolean;
	viewFlag: boolean = false;
	removeCommitteeCode: boolean = false;



	submitted: boolean = false;

	displayedColumns = ['committee_name_en', 'committee_name_ar', 'committee_code', 'committee_type_name_ar', 'name', 'committeee_members_count', 'actions'];


	addFlag: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;

	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		private _committeeService: CommitteeService,
		private roleService: RoleService)
		 {

			// this.displayedColumns = ['committee_name_en', 'committee_name_ar', 'committee_code', 'name', 'committeee_members_count', 'actions'];
		}

	/** LOAD DATA */
	ngOnInit() {
		this.getLanguage();
		this.checkButtonAccess();
		this._committeeService.getRemoveCommitteeCodeFeatureVariable().subscribe(
			res => {
				this.removeCommitteeCode = res.removeCommitteeCodeField;
				if (this.removeCommitteeCode) {
					this.displayedColumns.splice(2, 1);
					this.displayedColumns.forEach((element, index) => {
						if (element == 'committee_code') {
							this.displayedColumns.splice(index, 1);
						}
					});
				}
			}
		);


		// this.getRoles();
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


	}




	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.SortDirection =
			this.sort.direction !== "" ? this.sort.direction : "DESC";
		this.dataSourceLength = false;
		if (this.activeIdString === CommitteeTabs.CURRENTCOMMITTEES) {
			this.getCurrentCommittees();
		} else if (this.activeIdString === CommitteeTabs.PENDINGCOMMITTEES) {
			this.getPendingCommittees();
		}
		else if (this.activeIdString === CommitteeTabs.MYCOMMITTEE) {
			this.getMyCommittees();
		}

	}
	getPendingCommittees() {
		this._crudService.getPaginatedList<PagedResult>('committee-requests', this.filterObject).
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
	getCurrentCommittees() {
		this._crudService.getPaginatedList<PagedResult>('admin/committees', this.filterObject).
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

	getMyCommittees() {
		this._crudService.getPaginatedList<PagedResult>('admin/my-committees', this.filterObject).
			subscribe(res => {
				this.loadingSubject.next(false);
				this.paginatorTotal$ = res.Results['TotalRecords'];
				this.dataSource = res.Results['Results'];
				if (this.dataSource.length === 0) {
					this.dataSourceLength = true;
				}
			}, error => {
				this.loadingSubject.next(false);
			}
			);
	}



	edit(id: any) {
		this.router.navigate(['/committees/edit', id]);
	}

	delete(id: any) {
		const _title: string = this.translate.instant('COMMITTEES.DELETE.DELETECOMMITTEE');
		const _description: string = this.translate.instant('COMMITTEES.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('COMMITTEES.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('COMMITTEES.DELETE.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<Committee>('admin/committees', id).
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


	deleteRequest(id: any) {
		const _title: string = this.translate.instant('COMMITTEES.DELETE.DELETECOMMITTEE');
		const _description: string = this.translate.instant('COMMITTEES.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('COMMITTEES.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('COMMITTEES.DELETE.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<AdminRequest>('requests', id).
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

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	checkButtonAccess() {
		this.checkAddFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
	}

	checkAddFlag() {
		this.roleService.canAccess(Right.ADDNEWCOMMITTEE).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}

	checkEditFlag() {
		this.roleService.canAccess(Right.COMMITTEEEDIT).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

	checkDeleteFlag() {
		this.roleService.canAccess(Right.DELETE_COMMITTEE).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => { });
	}
}
