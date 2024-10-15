import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// RXJS
import { tap, finalize } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';

// Models
import { FilterObject } from '../../../../core/models/filter-object';
import { PagedResult } from '../../../../core/models/paged-result';


// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

// Services
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { environment } from '../../../../../environments/environment';
import { TranslationService } from '../../../../core/services/translation.service';
import { MeetingParticipantAlternative } from '../../../../core/models/meeting-participant-alternative';

@Component({
    selector: 'm-meeting-absence-list',
    templateUrl: './meeting-absence-list.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})

export class MeetingAbsenceListComponent implements OnInit {

    dataSource: Array<MeetingParticipantAlternative> = [];
	dataSourceLength: boolean = false;

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	isCollapsed: boolean = false;
	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject = new FilterObject();
	submitted: boolean = false;

	displayedColumns = [];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	isArabic: boolean;

	meeting_schedule_from_date ;
	meeting_schedule_to_date ;

	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private translate: TranslateService) { }

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
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.dataSourceLength = false;
		this.setDateModel();
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this._crudService.getPaginatedList<PagedResult>('admin/manage-absence', this.filterObject).
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
        if (this.isArabic) {
            this.displayedColumns = ['meeting_title_ar', 'name_ar', 'rejection_reason_comment'];
        } else {
            this.displayedColumns = ['meeting_title_en', 'name', 'rejection_reason_comment'];
        }
	}

	setDateModel() {
        if (this.meeting_schedule_from_date != null) {
            if (this.meeting_schedule_from_date.year != null) {
				this.filterObject.SearchObject.meeting_schedule_from =
				this.meeting_schedule_from_date.year + '-' + this.meeting_schedule_from_date.month + '-' + this.meeting_schedule_from_date.day;
            }

		}
        if (this.meeting_schedule_to_date != null) {
            if (this.meeting_schedule_to_date.year != null) {
				this.filterObject.SearchObject.meeting_schedule_to =
				this.meeting_schedule_to_date.year + '-' + this.meeting_schedule_to_date.month + '-' + this.meeting_schedule_to_date.day;
            }
		}
	}


	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.meeting_schedule_from_date = null;
		this.meeting_schedule_to_date = null;
		this.getList();
	};

}
