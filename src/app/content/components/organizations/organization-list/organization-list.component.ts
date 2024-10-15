import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// RXJS
import { tap, finalize } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable } from 'rxjs';

// Models
import { FilterObject } from '../../../../core/models/filter-object';
import { Organization } from '../../../../core/models/organization';
import { PagedResult } from '../../../../core/models/paged-result';

// Material
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

// Services
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { Role } from '../../../../core/models/role';
import { environment } from './../../../../../environments/environment';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { Right } from '../../../../core/models/enums/rights';

@Component({
	selector: 'm-organization-list',
	templateUrl: './organization-list.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class OrganizationListComponent implements OnInit {


	dataSource: Array<Organization> = [];
	dataSourceLength: boolean = false;
	selectedAll: boolean = false;
	activeDeactiveGroup: boolean = false;
	organizationsIds: Array<number> = [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	isCollapsed: boolean = false;
	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject = new FilterObject();

	displayedColumns = ['select', 'original_image_url', 'organization_name_ar', 'organization_name_en',
		'name', 'organization_phone', 'email', 'organization_number_of_users', 'actions'];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	imagesBaseURL = environment.imagesBaseURL;
	isArabic: boolean;
	idParameter: number;
	canDoAction: boolean = true;
	organizationsSelected: Array<any> = [];

	editFlag: boolean = false;
	path: string;

	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService, private _organizationService: OrganizationService,
		private _translationService: TranslationService,
		private translate: TranslateService,
		private roleService: RoleService) { }

	/** LOAD DATA */
	ngOnInit() {
		this.getLanguage();
		this.checkEditFlag();
		this.filterObject.SearchObject = {};
	}

	ngAfterViewInit(): void {
		this.route.url.subscribe({
			next: (url) => {
				this.path = url[0].path;
				this.filterObject.SearchObject = {};
				if (this.path != 'requests') {
					this.filterObject.SearchObject.is_active = this.path;
					this.idParameter = +this.path;
				} else if (this.path == 'requests') {
					this.filterObject.SearchObject.is_active = null;
				}
				this.getList();
			},
			error: error => {
				console.log('error');
			}
		});
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
		this.dataSourceLength = false;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this._crudService.getPaginatedList<PagedResult>('admin/organizations/' + this.path, this.filterObject).
			subscribe(res => {
				this.loadingSubject.next(false);
				this.paginatorTotal$ = res.TotalRecords;
				this.dataSource = res.Results;
				this.selectedAll = false;
				this.activeDeactiveGroup = false;
				if (this.dataSource.length === 0) {
					this.dataSourceLength = true;
				}
			},
				error => {
					this.loadingSubject.next(false);
				});
	}

	activeDeactive(organization: Organization, buttonType: number) {
		let _description: string = '';
		let _waitDesciption: string = '';
		let _activationMessage = ``;
		let _buttonText = '';
		this.canDoAction = false;

		if (organization.is_active === true || buttonType === 0) {
			_description = this.translate.instant('ORGANIZATIONS.DELETE.DEACTIVEDESCRIPTION');
			_waitDesciption = this.translate.instant('ORGANIZATIONS.DELETE.DEACTIVEWAITDESCRIPTION');
			_activationMessage = this.translate.instant('ORGANIZATIONS.DELETE.DEACTIVEMESSAGE');
			_buttonText = this.translate.instant('ORGANIZATIONS.DELETE.DEACTIVEBUTTON');
		} else if (organization.is_active === false || buttonType === 1) {
			_description = this.translate.instant('ORGANIZATIONS.DELETE.ACTIVEDESCRIPTION');
			_waitDesciption = this.translate.instant('ORGANIZATIONS.DELETE.ACTIVEWAITDESCRIPTION');
			_activationMessage = this.translate.instant('ORGANIZATIONS.DELETE.ACTIVEMESSAGE');
			_buttonText = this.translate.instant('ORGANIZATIONS.DELETE.ACTIVEBUTTON');
		}
		if (organization.is_active === null && buttonType === 0) {
			organization.is_active = true;
		}

		this.showdialog(_description, _waitDesciption, _buttonText, _activationMessage, [organization.id], !organization.is_active);
	}

	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.route.url.subscribe(url => {
			this.path = url[0].path;
			this.filterObject.SearchObject = {};
			if (this.path != 'requests') {
				this.filterObject.SearchObject.is_active = this.path;
				this.idParameter = +this.path;
			} else if (this.path == 'requests') {
				this.filterObject.SearchObject.is_active = null;
			}
			this.getList();
		},
			error => {
				console.log('error');
			});
		this.getList();
	};

	selectAll() {
		if (this.selectedAll === true) {
			this.activeDeactiveGroup = true;
			this.dataSource.forEach(organization => {
				organization.is_selected = true;
				this.organizationsIds.push(organization.id);
			});
		} else {
			this.activeDeactiveGroup = false;
			this.dataSource.forEach(organization => {
				organization.is_selected = false;
			});
			this.organizationsIds = [];
		}
	}

	showdialog(_description, _waitDesciption, _buttonText, _activationMessage, organizationsIdsArray, activeDeactiveflag) {

		const _title: string = this.translate.instant('ORGANIZATIONS.DELETE.TITLE');
		const dialogRef = this.layoutUtilsService.activateElement(_title, _description, _waitDesciption, _buttonText);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.canDoAction = true;
				return;
			}
			this._organizationService.updateOrganizationActiveState({
				organizations_ids: organizationsIdsArray,
				is_active: activeDeactiveflag
			})
				.subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_activationMessage, MessageType.Update);
					this.paginator.pageIndex = 0;
					this.getList();
					this.canDoAction = true;
				},
					error => {
						this.loadingSubject.next(false);
						this.canDoAction = true;
						const _message = this.translate.instant('ORGANIZATIONS.DELETE.MESSAGE');
						this.layoutUtilsService.showActionNotification(_message);
					});
		});
	}

	setActiveDeactive(activeDeactiveState: string) {
		let is_active = false;
		let _description: string = '';
		let _waitDesciption: string = '';
		let _activationMessage = ``;
		let _buttonText = '';

		if (activeDeactiveState === 'active') {
			is_active = true;
			_description = this.translate.instant('ORGANIZATIONS.DELETE.ACTIVEDESCRIPTIONLIST');
			_waitDesciption = this.translate.instant('ORGANIZATIONS.DELETE.ACTIVEWAITDESCRIPTIONLIST');
			_activationMessage = this.translate.instant('ORGANIZATIONS.DELETE.ACTIVEMESSAGELIST');
			_buttonText = this.translate.instant('ORGANIZATIONS.DELETE.ACTIVEBUTTON');

		} else {
			_description = this.translate.instant('ORGANIZATIONS.DELETE.DEACTIVEDESCRIPTIONLIST');
			_waitDesciption = this.translate.instant('ORGANIZATIONS.DELETE.DEACTIVEWAITDESCRIPTIONLIST');
			_activationMessage = this.translate.instant('ORGANIZATIONS.DELETE.DEACTIVEMESSAGELIST');
			_buttonText = this.translate.instant('ORGANIZATIONS.DELETE.DEACTIVEBUTTON');
		}

		this.showdialog(_description, _waitDesciption, _buttonText, _activationMessage, this.organizationsIds, is_active);
	}

	selectOrganization(organization: Organization) {
		if (organization.is_selected) {
			this.organizationsIds.push(organization.id);
			this.organizationsSelected.push(organization);
			this.activeDeactiveGroup = true;
		} else {
			const key = this.organizationsIds.indexOf(organization.id);
			const keyOrganizationSelected = this.organizationsSelected.indexOf(organization);
			this.organizationsIds.splice(key, 1);
			this.organizationsSelected.splice(keyOrganizationSelected, 1);
			if (this.organizationsIds.length === 0) {
				this.activeDeactiveGroup = false;
			}
		}

	}

	edit(organizationId: number) {
		this.router.navigate(['/organizations/edit', organizationId]);
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	checkEditFlag() {
		this.roleService.canAccess(Right.ORGANIZATIONEDIT).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}
}
