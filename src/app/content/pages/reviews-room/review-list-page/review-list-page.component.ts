import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit } from "@angular/core";
import { FilterObject } from "../../../../core/models/filter-object";
import { CommitteeService } from "../../../../core/services/committee/committee.service";
import { CrudService } from "../../../../core/services/shared/crud.service";
import { TranslationService } from "../../../../core/services/translation.service";
import { Committee } from "../../../../core/models/committee";
import { BehaviorSubject, Observable } from "rxjs";
import { Document } from '../../../../core/models/document';
import { DocumentStatus } from "../../../../core/models/document-status";
import { DocumentTabs } from "../../../../core/models/enums/document-tas";
import { PagedResult } from "../../../../core/models/paged-result";
import { NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { Right } from "../../../../core/models/enums/rights";
import { RoleService } from "../../../../core/services/security/roles.service";
import { ActivatedRoute } from "@angular/router";
import { VideoGuideService } from "../../../../core/services/video-guide/video-guide.service";

@Component({
	selector: "m-review-list-page",
	templateUrl: "./review-list-page.component.html",
	changeDetection: ChangeDetectionStrategy.Default,
})
export class ReviewListPageComponent implements OnInit, AfterViewInit {
	
	activeIdString: string;
	committees: Array<Committee> = [];
	isCollapsed: boolean = false;
	committeeBindLabel: string = "committee_name_ar";
	statusBindLabel: string = "document_status_name_ar";
	filterObject = new FilterObject();
	isArabic: boolean;
	loadingSubject = new BehaviorSubject<boolean>(false);
	dataSourceLength: boolean = false;
	paginatorTotal$: Observable<number>;
	dataSource: Array<Document> = [];
	documentStatuses: Array<DocumentStatus> = [];
	addFlag: boolean = false;
	startDateModel;
	endDateModel;

	constructor(
		private _translationService: TranslationService,
		private _crudService: CrudService,
		private _roleService: RoleService,
		private route: ActivatedRoute,
		private videoGuideService: VideoGuideService,
		private committeeService: CommitteeService
	) {}

	ngOnInit() {
		this.getCommittees();
		this.checkButtonAccess();
		this.getLanguage();
		this.getDocumentStatuses();
		this.filterObject.SearchObject = {};
		this.route.queryParams.subscribe((queryParams) => {
			if (queryParams.activeTab) {
				this.activeIdString = queryParams.activeTab;
			} else {
				this.activeIdString = DocumentTabs.allDocuments;
			}
			this.getList();
		});
	}

	ngAfterViewInit(): void {
		this.checkTutorialGuide();
	}

	getLanguage() {
		this.isArabic =  this._translationService.isArabic();
		this.committeeBindLabel = this.isArabic?'committee_name_ar' : 'committee_name_en';
		this.statusBindLabel = this.isArabic? 'document_status_name_ar' : 'document_status_name_en';
	}

	checkButtonAccess() {
		this.checkAddFlag();
	}

	checkAddFlag(){
		this._roleService.canAccess(Right.ADD_DOCUMENT).subscribe(res => {
			if (res.canAccess === 1) {
				this.addFlag = true;
			}
		}, error => { });
	}

	getCommittees() {
		this.committeeService.getOrganizationCommittees<Committee>().subscribe(res => {
			this.committees = res;
		}, error => {
		});
	}

	getDocumentStatuses(){
		this._crudService.getList<DocumentStatus>('admin/document-statuses').subscribe(res => {
			this.documentStatuses = res;
		}, error => {
		});
	}

	getList() {
		this.loadingSubject.next(true);
		this.filterObject.PageNumber = 1;
		this.filterObject.SortBy = 'id';
		this.filterObject.SortDirection = 'desc';
		this.dataSourceLength = false;
		this.setDateModel();
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

	beforeChange($event: NgbNavChangeEvent) {
		this.activeIdString = $event.nextId;
		this.getList();
	}

	setDateModel() {
        if (this.startDateModel != null) {
            if (this.startDateModel.year != null) {
				this.filterObject.SearchObject.review_start_date =
				this.startDateModel.year + '-' + this.startDateModel.month + '-' + this.startDateModel.day + ' 00:00:00';
            }
		}
        if (this.endDateModel != null) {
            if (this.endDateModel.year != null) {
				this.filterObject.SearchObject.review_end_date =
				this.endDateModel.year + '-' + this.endDateModel.month + '-' + this.endDateModel.day + ' 00:00:00';
            }
		}
	}

	resetSearch() {
		this.filterObject.SearchObject = {};
		this.startDateModel = null;
		this.endDateModel = null;
		this.getList();
	};

	checkTutorialGuide(){
		let list = this.videoGuideService.getGuideStepsList();
		if(list && list.length > 0){
			this.videoGuideService.startGuide(list);
		}
	}
}
