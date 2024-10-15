
import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, merge } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

// Service
import { UploadService } from '../../../../core/services/shared/upload.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { MessageType, LayoutUtilsService } from '../../../../core/services/layout-utils.service';
import { FilterObject } from '../../../../core/models/filter-object';
import { UserOnlineConfiguration } from '../../../../core/models/user-online-configuration';
import { PagedResult } from '../../../../core/models/paged-result';
import { tap } from 'rxjs/operators';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { OnlineMeetingApp } from '../../../../core/models/online-meeting-app';
import { RoleService } from '../../../../core/services/security/roles.service';
import { Right } from '../../../../core/models/enums/rights';
import { VideoGuideService } from '../../../../core/services/video-guide/video-guide.service';

@Component({
    selector: 'm-online-account-list',
    templateUrl: './online-account-list.component.html',
    changeDetection: ChangeDetectionStrategy.Default
})
export class OnlineAccountListComponent implements OnInit, AfterViewInit {

    isCollapsed: boolean = false;
    dataSource: Array<UserOnlineConfiguration> = [];
	dataSourceLength: boolean = false;
    filterObject = new FilterObject();
    loadingSubject = new BehaviorSubject<boolean>(false);
    loading$ = this.loadingSubject.asObservable();
    paginatorTotal$: Observable<number>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns = ['user_online_configuration_name', 'is_active', 'type', 'actions'];
	pageSize = environment.pageSize;
	isArabic: boolean;
	onlineMeetingApps: Array<OnlineMeetingApp> = [];
	addFlag: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;
	
    constructor(private _crudService: CrudService, private route: ActivatedRoute,
        private router: Router, private _uploadService: UploadService,
		private translate: TranslateService,
		private roleService: RoleService,
		private videoGuideService: VideoGuideService,
        private _translationService: TranslationService,
        private layoutUtilsService: LayoutUtilsService) {

	}

    ngOnInit() {
		this.getLanguage();
		this.getOnlineMeetingApps();
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

	getOnlineMeetingApps() {
        this._crudService.getList<OnlineMeetingApp>('admin/online-meeting-apps').subscribe(res => {
            this.onlineMeetingApps = res;
        });
	}
	
    getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

    getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.dataSourceLength = false;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this._crudService.getPaginatedList<PagedResult>('admin/user-online-configurations', this.filterObject).
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
        this.router.navigate(['/online-configurations', id]);
    }

    resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
    }; 
    
    delete(id: any) {
		const _title: string = this.translate.instant('ONLINE_CONFIGURATIONS.DELETE.TITLE');
		const _description: string = this.translate.instant('ONLINE_CONFIGURATIONS.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('ONLINE_CONFIGURATIONS.DELETE.WAIT_DESCRIPTION');
		const _deleteMessage = this.translate.instant('ONLINE_CONFIGURATIONS.DELETE.DELETE_MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<UserOnlineConfiguration>('admin/user-online-configurations', id).
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

	checkButtonAccess(){
		this.checkAddFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
	}

	checkAddFlag(){
		this.roleService.canAccess(Right.ADD_ONLINE_ACCOUNTS).subscribe(res => {
				if (res.canAccess === 1) {
					this.addFlag = true;
				}
			}, error => {});
	}

	checkEditFlag(){
		this.roleService.canAccess(Right.EDIT_ONLINE_ACCOUNTS).subscribe(res => {
				if (res.canAccess === 1) {
					this.editFlag = true;
				}
			}, error => {});
	}

	checkDeleteFlag(){
		this.roleService.canAccess(Right.DELETE_ONLINE_ACCOUNTS).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => {});
	}

	checkTutorialGuide(){
		let list = this.videoGuideService.getGuideStepsList();
		if(list && list.length > 0){
			this.videoGuideService.startGuide(list);
		}
	}
}
