
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

@Component({
  selector: 'm-shared-two-column-table',
  templateUrl: './shared-two-column-table.component.html',
  styleUrls: ['./shared-two-column-table.component.scss']
})
export class SharedTwoColumnTableComponent {
	@Input() dataSourceLength: boolean;
	@Input() dataSource: Array<Committee>;



	// Paginator | Paginators count





	pageSize = environment.pageSize;
	isArabic: boolean;
	viewFlag: boolean = false;
	removeCommitteeCode: boolean = false;



	submitted: boolean = false;

	displayedColumns = ['column_1', 'column_2'];




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

	}

	ngAfterViewInit(): void {

	}











	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}


}
