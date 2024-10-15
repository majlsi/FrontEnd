import { environment } from './../../../../../environments/environment';
import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';
import { Router, ActivatedRoute } from '@angular/router';

// RXJS
import { tap } from 'rxjs/operators';
import { merge, BehaviorSubject, Observable, forkJoin } from 'rxjs';

import { LayoutUtilsService, MessageType } from '../../../../core/services/layout-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { RoleService } from '../../../../core/services/security/roles.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { Right } from '../../../../core/models/enums/rights';


@Component({
	selector: 'm-mjlsi-admin-dashboard',
	templateUrl: './mjlsi-admin-dashboard.component.html',
	changeDetection: ChangeDetectionStrategy.Default
})
export class MjlsiAdminDashboardComponent implements OnInit {
	imagesBaseURL = environment.imagesBaseURL;
	showMore: boolean = false;
	canViewOrganizationDashboard: boolean = false;
	multi: any[];

	view: any[] = [600, 235];

	colorScheme = {
		domain: ['#716aca', '#ffb822', '#00c5dc']
	};

	single: any = [
		{
			'name': 'منظمات مفعلة ',
			'value': 40632
		},
		{
			'name': 'منظمات غير مفعلة',
			'value': 49737
		},
		{
			'name': 'طلبات جديدة',
			'value': 36745
		}
	];

	// == Start ngx-charts-bar-vertical-2d //
	single2: any[];
	multi2: any[] = [
		{
			'name': '0 - 10',
			'series': [
				{
					'name': '2010',
					'value': 7300000
				},
				{
					'name': '2011',
					'value': 8940000
				}
			]
		},

		{
			'name': '11 - 50',
			'series': [
				{
					'name': '2010',
					'value': 7870000
				},
				{
					'name': '2011',
					'value': 8270000
				}
			]
		},

		{
			'name': '51 - 100',
			'series': [
				{
					'name': '2010',
					'value': 5000002
				},
				{
					'name': '2011',
					'value': 5800000
				}
			]
		},

		{
			'name': '101 - 200',
			'series': [
				{
					'name': '2010',
					'value': 5000002
				},
				{
					'name': '2011',
					'value': 5800000
				}
			]
		},

		{
			'name': '201 - 500',
			'series': [
				{
					'name': '2010',
					'value': 5000002
				},
				{
					'name': '2011',
					'value': 5800000
				}
			]
		},

		{
			'name': '501 - 1000',
			'series': [
				{
					'name': '2010',
					'value': 5000002
				},
				{
					'name': '2011',
					'value': 5800000
				}
			]
		}
	];

	view2: any[] = [475, 235];

	// options
	showXAxis = true;
	showYAxis = true;
	gradient = false;
	showLegend = true;
	showXAxisLabel = false;
	xAxisLabel = '';
	showYAxisLabel = false;
	yAxisLabel = '';

	colorScheme2 = {
		domain: ['#86c7f3', '#ffa1b5']
	};
	// == End ngx-charts-bar-vertical-2d //


	pageSize = environment.pageSize;
	highActiveOrganizationsObs: Observable<any>;
	organizationsBarChartStatisticsObs: Observable<any>;
	organizationsPieChartStatisticsObs: Observable<any>;
	organizationsBarChartStatisticsAr: any;
	organizationsBarChartStatisticsEn: any;
	organizationsPieChartStatisticsAr: any;
	organizationsPieChartStatisticsEn: any;
	isArabic: any;
	highActiveOrganizations: any;
	isNoPieChartData: boolean = false;

	constructor(
		private route: ActivatedRoute,
		private _crudService: CrudService,
		private router: Router,
		private layoutUtilsService: LayoutUtilsService,
		private _translationService: TranslationService,
		private _organizationService: OrganizationService,
		private roleService: RoleService) { }

	ngOnInit() {
		this.checkShowMoreFlag();
		this.checkViewOrganizationDashboardFlag();
		this.getLanguage();
		this.getOrganizationsBarChartStatistics();
		this.getOrganizationsPieChartStatistics();
		this.getHighActiveOrganizations();
		forkJoin([this.organizationsBarChartStatisticsObs, this.organizationsPieChartStatisticsObs,
		this.highActiveOrganizationsObs])
			.subscribe(data => {

				this.organizationsBarChartStatisticsAr = data[0].statisticsDataAr;
				this.organizationsBarChartStatisticsEn = data[0].statisticsDataEn;

				this.organizationsPieChartStatisticsAr = data[1].statisticsDataAr;
				this.organizationsPieChartStatisticsEn = data[1].statisticsDataEn;

				if (data[1].is_no_data) {
					this.isNoPieChartData = true;
				}

				this.highActiveOrganizations = data[2];

			},
				error => {
					// console.log('error');
				});
	}

	getOrganizationsPieChartStatistics() {
		this.organizationsPieChartStatisticsObs = this._organizationService.getOrganizationsPieChartStatistics();
	}


	getOrganizationsBarChartStatistics() {
		this.organizationsBarChartStatisticsObs = this._organizationService.getOrganizationsBarChartStatistics();
	}

	getHighActiveOrganizations() {
		this.highActiveOrganizationsObs = this._organizationService.getHighActiveOrganizations();
	}
	getLanguage() {
		this.isArabic = this._translationService.isArabic();
	}

	openDashboard(highActiveOrganization) {
		if (this.canViewOrganizationDashboard === true) {
			this.router.navigate(['/dashboard/admin_dashboard/organization_dashboard', highActiveOrganization.id]);
		}
	}

	checkShowMoreFlag() {
		this.roleService.canAccess(Right.APPROVEDORGANISATIONS).subscribe(res => {
			if (res.canAccess === 1) {
				this.showMore = true;
			}
		}, error => { });
	}

	checkViewOrganizationDashboardFlag() {
		this.roleService.canAccess(Right.ORGANIZATIONDASHBOARD).subscribe(res => {
			if (res.canAccess === 1) {
				this.canViewOrganizationDashboard = true;
			}
		}, error => { });
	}

	onSelect(event) {

	}
}
