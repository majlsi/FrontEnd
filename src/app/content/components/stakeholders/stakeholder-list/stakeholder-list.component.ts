import { Component, OnInit, ChangeDetectionStrategy, ViewChild, Input, AfterViewInit } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// RXJS
import { tap, finalize } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable, forkJoin } from 'rxjs';

// Models
import { FilterObject } from '../../../../core/models/filter-object';
import { User } from '../../../../core/models/user';
import { PagedResult } from '../../../../core/models/paged-result';

// Material
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { Role } from '../../../../core/models/role';
import { environment } from '../../../../../environments/environment';
import { UserService } from '../../../../core/services/security/users.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { RoleService } from '../../../../core/services/security/roles.service';
import { Right } from '../../../../core/models/enums/rights';
import { VideoGuideService } from '../../../../core/services/video-guide/video-guide.service';
import { StakeholderService } from '../../../../core/services/stakeholder/stakeholder.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { saveAs } from "file-saver";
import * as $ from 'jquery';
import { ImportStakeholdersComponent } from '../import-stakeholders/import-stakeholders.component';

@Component({
	selector: 'm-stakeholder-list',
	templateUrl: './stakeholder-list.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})

export class StakeholderListComponent implements OnInit, AfterViewInit {

	dataSource: Array<User> = [];
	dataSourceLength: boolean = false;
	roles: Array<Role> = [];
	loadingSubject = new BehaviorSubject<boolean>(false);
	loading$ = this.loadingSubject.asObservable();
	isCollapsed: boolean = false;
	currentUser: User;
	currentUserObs: Observable<any>;
	modalRef: NgbModalRef;

	// Paginator | Paginators count
	paginatorTotal$: Observable<number>;

	filterObject = new FilterObject();

	displayedColumns = ['name', 'email', 'date_of_birth', 'identity_number', 'share', 'actions'];

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	pageSize = environment.pageSize;
	isArabic: boolean;
	canAddUser: boolean = false;
	bindLabel: string = 'role_name_ar';
	canDoAction: boolean = true;
	@Input() isParticipant: boolean;
	addFlag: boolean = false;
	editFlag: boolean = false;
	deleteFlag: boolean = false;
	activeFlag: boolean = false;
	deActiveFlag: boolean = false;
	errorMessages: Array<string> = [];
	excelFile: File;

	constructor(private route: ActivatedRoute, private _crudService: CrudService,
		private router: Router, private layoutUtilsService: LayoutUtilsService,
		private _userService: UserService, private _translationService: TranslationService,
		private translate: TranslateService,
		private videoGuideService: VideoGuideService,
		private roleService: RoleService,
		private _stakeholderService: StakeholderService,
		private modalService: NgbModal) { }

	/** LOAD DATA */
	ngOnInit() {
		// console.log(this.isParticipant);
		this.getLanguage();
		this.checkButtonAccess();
		this.checkIfCanAddUsers();
		this.getCurrentUser();
		this.filterObject.SearchObject = {};
		if (this.isParticipant) {
			this.filterObject.SearchObject.is_participant = true;
		}
	}

	ngAfterViewInit(): void {
		/* Data load will be triggered in two cases:
	- when a pagination event occurs => this.paginator.page
	- when a sort event occurs => this.sort.sortChange
	**/
		forkJoin([this.currentUserObs]).subscribe({next: data => {
			this.currentUser = data[0].user;
			merge(this.sort.sortChange, this.paginator.page)
				.pipe(
					tap(() => {
						this.getList();
					})
				)
				.subscribe();

			this.getList();
			this.getRoles();
		}});
		this.checkTutorialGuide();
	}

	getList() {
		this.dataSourceLength = false;
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.SortDirection = this.sort.direction !== '' ? this.sort.direction : 'desc';
		this._crudService.getPaginatedList<PagedResult>('stakeholders', this.filterObject).
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
		if (this.isParticipant) {
			this.router.navigate(['/participants/edit', id]);
		} else {
			this.router.navigate(['/Stakeholders/edit', id]);
		}
	}

	delete(id: any) {
		const _title: string = this.translate.instant('STAKEHOLDER.DELETE.DELETESTAKEHOLDER');
		const _description: string = this.translate.instant('STAKEHOLDER.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('STAKEHOLDER.DELETE.WAITDESCRIPTION');
		const _deleteMessage = this.translate.instant('STAKEHOLDER.DELETE.DELETEMESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<User>('stakeholders', id).
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
		if (this.isParticipant) {
			this.filterObject.SearchObject.is_participant = true;
		}
		this.getList();
	};

	getRoles() {
		this._crudService.getList<Role>('admin/access-roles').subscribe(res => {
			this.roles = res;
			if (!this.isParticipant) {
				this.roles = this.roles.filter(function (item) {
					return item.can_assign === 1;
				});
			}
		});
	}

	activeDeactive(user: User, buttonType: number) {
		this.canDoAction = false;
		const _title: string = this.translate.instant('STAKEHOLDER.DELETE.STAKEHOLDERACTIVATION');
		let _description: string = '';
		let _waitDesciption: string = '';
		let _activationMessage = ``;
		let _buttonText = '';

		if (user.is_active === true || buttonType === 0) {
			_description = this.translate.instant('STAKEHOLDER.DELETE.DEACTIVEDESCRIPTION');
			_waitDesciption = this.translate.instant('STAKEHOLDER.DELETE.DEACTIVEWAITDESCRIPTION');
			_activationMessage = this.translate.instant('STAKEHOLDER.DELETE.DEACTIVEMESSAGE');
			_buttonText = this.translate.instant('USERS.DELETE.DEACTIVEBUTTON');
		} else if (user.is_active === false || buttonType === 1) {
			_description = this.translate.instant('STAKEHOLDER.DELETE.ACTIVEDESCRIPTION');
			_waitDesciption = this.translate.instant('STAKEHOLDER.DELETE.ACTIVEWAITDESCRIPTION');
			_activationMessage = this.translate.instant('STAKEHOLDER.DELETE.ACTIVEMESSAGE');
			_buttonText = this.translate.instant('USERS.DELETE.ACTIVEBUTTON');
		}

		const dialogRef = this.layoutUtilsService.activateElement(_title, _description, _waitDesciption, _buttonText);
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				this.canDoAction = true;
				return;
			}
			this._stakeholderService.updateUserActiveState({
				stakesholder_id: user.id,
				is_active: !user.is_active
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
						const _message = this.translate.instant('STAKEHOLDER.DELETE.MESSAGE');
						this.layoutUtilsService.showActionNotification(_message);
					});
		});

	}

	getCurrentUser() {
		this.currentUserObs = this._userService.getCurrentUser();
	}

	getLanguage() {
		this.isArabic = this._translationService.isArabic();
		if (!this.isArabic) {
			this.bindLabel = 'role_name';
		}
	}

	checkIfCanAddUsers() {
		this._userService.checkIfCanAddUsers<any>({}).subscribe(res => {
			this.canAddUser = res.can_add;
		}, error => {

		});
	}

	checkButtonAccess() {
		this.checkAddFlag();
		this.checkEditFlag();
		this.checkDeleteFlag();
		this.checkActiveFlag();
		this.checkDeactiveFlag();
	}

	checkAddFlag() {
		if (this.isParticipant) {
			this.roleService.canAccess(Right.ADDPARTICIPANT).subscribe(res => {
				if (res.canAccess === 1) {
					this.addFlag = true;
				}
			}, error => { });
		} else {
			this.roleService.canAccess(Right.STAKEHOLDER_ADD).subscribe(res => {
				if (res.canAccess === 1) {
					this.addFlag = true;
				}
			}, error => { });
		}
	}

	checkEditFlag() {
		if (this.isParticipant) {
			this.roleService.canAccess(Right.EDITPARTICIPANT).subscribe(res => {
				if (res.canAccess === 1) {
					this.editFlag = true;
				}
			}, error => { });
		} else {
			this.roleService.canAccess(Right.STAKEHOLDER_EDIT).subscribe(res => {
				if (res.canAccess === 1) {
					this.editFlag = true;
				}
			}, error => { });
		}
	}

	checkDeleteFlag() {
		if (this.isParticipant) {
			this.roleService.canAccess(Right.DELETE_PARTICIPANT).subscribe(res => {
				if (res.canAccess === 1) {
					this.deleteFlag = true;
				}
			}, error => { });
		} else {
			this.roleService.canAccess(Right.DELETE_STAKEHOLDER).subscribe(res => {
				if (res.canAccess === 1) {
					this.deleteFlag = true;
				}
			}, error => { });
		}
	}

	checkActiveFlag() {
		this.roleService.canAccess(Right.ACTIVE_STAKEHOLDER).subscribe(res => {
			if (res.canAccess === 1) {
				this.activeFlag = true;
			}
		}, error => { });
	}

	checkDeactiveFlag() {
		this.roleService.canAccess(Right.DE_ACTIVE_STAKEHOLDER).subscribe(res => {
			if (res.canAccess === 1) {
				this.deActiveFlag = true;
			}
		}, error => { });
	}

	checkTutorialGuide() {
		let list = this.videoGuideService.getGuideStepsList();
		if (list && list.length > 0) {
			this.videoGuideService.startGuide(list);
		}
	}

	downloadExcelTemplate() {
		this._stakeholderService.DownloadBlankExcelTemplate().subscribe(
			(response: any) => {
				saveAs(response, "BlankExcelTemplate.csv");
			},
			(err) => {
				for (let index = 0; index < err.Errors.length; index++) {
					this.errorMessages.push(err.Errors[index].ErrorMessage);
				}
			}
		);
	}

	// On file Select
	onChange(event) {
		this.errorMessages = [];
		this.excelFile = null;
		if (
			event.target.files && event.target.files[0].type == "text/csv"
		) {
			this.excelFile = event.target.files[0];
			this.uploadExcel();
		} else {
			let message = this.translate.instant("STAKEHOLDER.IMPORT.ERRORS.FILE_IS_INVALID");
			this.layoutUtilsService.showActionNotification(message, MessageType.Delete, 5000, true, false, 0, 'top', true);
		}
	}

	doOpen() {
		$('#input-file').click((ev) => {
			ev.stopPropagation();
		})
	}
	upload: boolean = false;
	successCount: number = 0;
	failedCount: number = 0;
	isUploaded: boolean = false;
	uploadExcel() {
		if (this.excelFile != null) {
			this.upload = true;
			this._stakeholderService
				.ValidStakeholdersFromExcel(this.excelFile)
				.subscribe(
					(res) => {
						this.modalRef = this.modalService.open(ImportStakeholdersComponent, {
							size: 'lg', backdrop: 'static',
							centered: true, keyboard: false
						});

						this.modalRef.componentInstance.dataSource = res.stakeholders;
						this.modalRef.result.then(res => {
							this.getList();
						})
						this.upload = false;
						this.isUploaded = true;
					},
					(err) => {
						this.upload = false;
						if (this.isArabic) {
							this.layoutUtilsService.showActionNotification(
								err.error_ar,
								MessageType.Delete,
								5000,
								true,
								false,
								0,
								'top',
								true
							);
						} else {
							this.layoutUtilsService.showActionNotification(
								err.error,
								MessageType.Delete,
								5000,
								true,
								false,
								0,
								'top',
								true
							);
						}

					}
				);
		} else {
			this.layoutUtilsService.showActionNotification(
				this.translate.instant("STAKEHOLDER.IMPORT.ERRORS.FILE_IS_REQUIRED"),
				MessageType.Delete,
				5000,
				true,
				false,
				0,
				'top',
				true
			);
		}
	}
}
