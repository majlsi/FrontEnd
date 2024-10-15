import { Component, OnInit } from '@angular/core';
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, merge } from 'rxjs';
import { FilterObject } from '../../../../core/models/filter-object';
import { MatPaginator } from '@angular/material/paginator';
import { environment } from '../../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../../../core/services/security/roles.service';
import { tap } from 'rxjs/operators';
import { PagedResult } from '../../../../core/models/paged-result';
import { Role } from '../../../../core/models/role';
import { Right } from '../../../../core/models/enums/rights';
import { TranslationService } from '../../../../core/services/translation.service';
import { HtmlMomTemplate } from '../../../../core/models/html-mom-template';
import { VideoGuideService } from '../../../../core/services/video-guide/video-guide.service';


@Component({
	selector: 'm-html-mom-template-list',
	templateUrl: './html-mom-template-list.component.html',

})


export class HtmlMomTemplateListComponent implements OnInit, AfterViewInit {
	isCollapsed: boolean = false;
	dataSource: Array<HtmlMomTemplate> = [];
	dataSourceLength: boolean = false;
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();

	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject = new FilterObject();

	displayedColumns = ['html_mom_template_name_ar', 'html_mom_template_name_en', 'actions'];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	isArabic: boolean;
	addFlag: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;

	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private translate: TranslateService,
		private roleService: RoleService,
		private videoGuideService: VideoGuideService,
		private _translationService: TranslationService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.getLanguage();
		this.checkButtonAccess();
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
		this.checkTutorialGuide();
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.dataSourceLength = false;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this._crudService.getPaginatedList<PagedResult>('admin/html-mom-templates', this.filterObject).
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


	edit(id: any) {
		this.router.navigate(['/mom-summary-templates/edit', id]);
	}

	delete(id: any) {
		const _title: string = this.translate.instant('HTML_MOM_TEMPLATE.DELETE.DELETEHTMLMOMTEMPLATE');
		const _description: string = this.translate.instant('HTML_MOM_TEMPLATE.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('HTML_MOM_TEMPLATE.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('HTML_MOM_TEMPLATE.DELETE.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<HtmlMomTemplate>('admin/html-mom-templates', id).
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

	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
	};

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	checkButtonAccess() {
		this.checkAddFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
	}

	checkAddFlag() {
		this.roleService.canAccess(Right.HTMLMOMTEMPLATEADD).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}

	checkEditFlag() {
		this.roleService.canAccess(Right.HTMLMOMTEMPLATEEDIT).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

	checkDeleteFlag() {
		this.roleService.canAccess(Right.HTMLMOMTEMPLATEDELETE).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => { });
	}

	checkTutorialGuide(){
		let list = this.videoGuideService.getGuideStepsList();
		if(list && list.length > 0){
			this.videoGuideService.startGuide(list);
		}
	}
}
