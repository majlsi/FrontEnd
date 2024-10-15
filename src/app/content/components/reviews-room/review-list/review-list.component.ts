import { ChangeDetectionStrategy, Component, OnInit, Input, ViewChild } from "@angular/core";
import { Observable, BehaviorSubject, merge } from "rxjs";
import { FilterObject } from "../../../../core/models/filter-object";
import { Document } from '../../../../core/models/document';
import { DocumentStatuses } from "../../../../core/models/enums/document-statuses";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslationService } from "../../../../core/services/translation.service";
import { environment } from "../../../../../environments/environment";
import { DocumentStatus } from "../../../../core/models/document-status";
import { tap } from "rxjs/operators";
import { DocumentTabs } from "../../../../core/models/enums/document-tas";
import { PagedResult } from "../../../../core/models/paged-result";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { LayoutUtilsService, MessageType } from "../../../../core/services/layout-utils.service";
import { DocumentService } from "../../../../core/services/document/document.service";
import { RoleService } from "../../../../core/services/security/roles.service";
import { Right } from "../../../../core/models/enums/rights";
import { UploadService } from "../../../../core/services/shared/upload.service";

@Component({
	selector: "m-review-list",
	templateUrl: "./review-list.component.html",
	changeDetection: ChangeDetectionStrategy.Default,
})
export class ReviewListComponent implements OnInit {

	@Input() dataSourceLength: boolean;
	@Input() dataSource: Array<Document>;
	@Input() loadingSubject: BehaviorSubject<boolean>;
	@Input() paginatorTotal$: Observable<number>;
	@Input() filterObject: FilterObject;
	@Input() documentStatuses: Array<DocumentStatus>;
	@Input() activeIdString: string;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	documentStatusEnm = DocumentStatuses;
	isArabic: boolean;
	editFlag: boolean = false;
	deleteFlag: boolean = false;
	displayedColumns = ["document_subject_ar", "added_by", "review_start_date", 
		"review_end_date", "document_status_id", "actions",];
	loading$;	
	pageSize = environment.pageSize;

	constructor(private _translationService: TranslationService,
		private _crudService: CrudService,
		private translate: TranslateService,
		private layoutUtilsService: LayoutUtilsService,
		private _documentService: DocumentService,
		private _roleService: RoleService,
		private uploadService: UploadService,
		private router: Router) {}

	ngOnInit() {
		this.getLanguage();
		this.checkButtonAccess();
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
			this.loading$ = this.loadingSubject.asObservable();
	}


	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	checkButtonAccess() {
		this.checkEditFlag();
		this.checkDeleteFlag();
	}

	checkEditFlag() {
		this._roleService.canAccess(Right.EDIT_DOCUMENT).subscribe(res => {
			if (res.canAccess === 1) {
				this.editFlag = true;
			}
		}, error => { });
	}

	checkDeleteFlag() {
		this._roleService.canAccess(Right.DELETE_DOCUMENT).subscribe(res => {
			if (res.canAccess === 1) {
				this.deleteFlag = true;
			}
		}, error => { });
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = this.paginator.pageIndex + 1;
		this.filterObject.SortBy = this.sort.active;
		this.filterObject.SortDirection =
			this.sort.direction !== "" ? this.sort.direction : "DESC";
		this.dataSourceLength = false;
		if (this.activeIdString == DocumentTabs.allDocuments) {
			delete this.filterObject.SearchObject.is_my_document;
			delete this.filterObject.SearchObject.is_document_assign_to_me;
		} else if (this.activeIdString === DocumentTabs.createdByMe) {
			this.filterObject.SearchObject.is_my_document = true;
			delete this.filterObject.SearchObject.is_document_assign_to_me;
		} else if (this.activeIdString === DocumentTabs.assignToMe) {
			delete this.filterObject.SearchObject.is_my_document;
			this.filterObject.SearchObject.is_document_assign_to_me = true;
		}
		this._crudService.getPaginatedList<PagedResult>('admin/documents',this.filterObject).subscribe(res => {
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

	edit(documentId) {
		this.router.navigate(['/reviews-room/edit', documentId]);
	}

	delete(documentId) {
		const _title: string = this.translate.instant('REVIEWS_ROOM.DELETE.TITLE');
		const _description: string = this.translate.instant('REVIEWS_ROOM.DELETE.DESCRIPTION');
		const _waitDesciption: string = this.translate.instant('REVIEWS_ROOM.DELETE.WAIT_DESCRIPTION');
		const _deleteMessage = this.translate.instant('REVIEWS_ROOM.DELETE.DELETE_MESSAGE');

		const dialogRef = this.layoutUtilsService.deleteElement(_title, _description, _waitDesciption, this.translate.instant('BUTTON.DELETE'));
		dialogRef.afterClosed().subscribe(res => {
			if (!res) {
				return;
			}
			this._crudService.delete<Document>('admin/documents', documentId).
				subscribe(pagedData => {
					this.layoutUtilsService.showActionNotification(_deleteMessage, MessageType.Delete);
					this.paginator.pageIndex = 0;
					this.getList();
				},
				error => {
					this.loadingSubject.next(false);
					this.layoutUtilsService.showActionNotification(this.isArabic? error.error_ar : error.error, MessageType.Delete);
				});
		});
	}

	download(documentData: Document, type: string){
		var show_notes = type == 'original'? false : true;
		if(show_notes){
			this._documentService.downloadDocument(documentData.id).subscribe(res => {
				this.downloadFile(res,documentData,type);
			});
		} else {
			this.uploadService.downloadFile(environment.imagesBaseURL +  documentData.document_url).subscribe((res) => {
				this.downloadFile(res,documentData,type);
			});
		}
	}

	downloadFile(res,documentData,type){
		const downloadURL = window.URL.createObjectURL(res);
		const link = document.createElement("a");
		link.href = downloadURL;
		link.download = (type == 'original') ? documentData.document_name : ('reviwed_' + documentData.document_name.split('.').pop() + '.pdf');
		link.click();
	}

	reviewRoom(document: Document) {
		if(document.can_add_review) {
			this.router.navigate(['/reviews-room/details', document.id],{ queryParams: {activeTab: this.activeIdString} });
		}
	}

	resetSearch = function () {
		this.filterObject.SearchObject = {};
		this.getList();
	};
}
