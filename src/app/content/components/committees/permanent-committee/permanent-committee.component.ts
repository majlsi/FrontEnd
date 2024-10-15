import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { environment } from "../../../../../environments/environment";
import { merge, BehaviorSubject, Observable, tap } from "rxjs";

// Models
import { FilterObject } from "../../../../core/models/filter-object";
import { Committee } from "../../../../core/models/committee";
import { PagedResult } from "../../../../core/models/paged-result";

// Material
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { LayoutUtilsService } from "../../../../core/services/layout-utils.service";

import { TranslationService } from "../../../../core/services/translation.service";
import { RoleService } from "../../../../core/services/security/roles.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
	selector: "m-permanent-committee",
	templateUrl: "./permanent-committee.component.html",
	styleUrls: ["./permanent-committee.component.scss"],
})
export class PermanentCommitteeComponent implements OnInit,AfterViewInit {
	dataSourceLength: boolean;
	dataSource: Array<Committee>;

	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject: FilterObject=new FilterObject();

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;



	pageSize = environment.pageSize;
	isArabic: boolean;
	viewFlag: boolean = false;

	submitted: boolean = false;

	displayedColumns = ["committee_name_en", "committee_name_ar", "name", "committeee_members_count"];


	constructor(private route: ActivatedRoute, private _crudService: CrudService, private router: Router, private layoutUtilsService: LayoutUtilsService, private _translationService: TranslationService, private translate: TranslateService, private roleService: RoleService) {

	}

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
		this.filterObject.SortDirection = this.sort.direction !== "" ? this.sort.direction : "DESC";
		this.dataSourceLength = false;

		this.getStandingCommittees();



	}
	getStandingCommittees() {
		this._crudService.getPaginatedList<PagedResult>("admin/committees/standing-committees", this.filterObject).subscribe(
			(res) => {
				this.loadingSubject.next(false);
				this.paginatorTotal$ = res.TotalRecords;
				this.dataSource = res.Results;
				if (this.dataSource.length === 0) {
					this.dataSourceLength = true;
				}
			},
			(error) => {
				this.loadingSubject.next(false);
			}
		);
	}


	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	viewCommittee(id) {
		this.router.navigate(['/permanent-committee/view/', id]);
	}
}
