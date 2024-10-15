import { Component, OnInit, ChangeDetectionStrategy, ViewChild, AfterViewInit } from '@angular/core';
import { CrudService } from '../../../../core/services/shared/crud.service';

// RXJS
import { forkJoin, Observable } from 'rxjs';


import { TranslationService } from '../../../../core/services/translation.service';
import { OrganizationService } from '../../../../core/services/organization/organization.service';
import { PagedResult } from '../../../../core/models/paged-result';
import { FilterObject } from '../../../../core/models/filter-object';
import { Router } from '@angular/router';

@Component({
  selector: 'm-committees-control-panel',
  templateUrl: './committees-control-panel.component.html',
  styleUrls: ['./committees-control-panel.component.scss']
})
export class CommitteesControlPanelComponent implements OnInit,AfterViewInit{

	isArabic: boolean;

	numOfPermanentCommittiees:any;
	numOfTemporaryCommittiees:any;
	numOfMembersOfStandingCommittiees:any;
	numOfFreezedCommitteeMembers:any;
	committeesStatuses:any;
	percentageOfEvaluation:any;

	passedDaysDatasource:any=[];
	passedDaysDatasourceLength:boolean=false;
	passedDaysDisplayedColumns = ['committee_name', 'passed_days'];

	committeeRemainPercentageToFinishDatasource:any=[];
	committeeRemainPercentageToFinishDatasourceLength:boolean=false;
	committeeRemainPercentageToFinishDisplayedColumns = ['committee_name', 'percentage'];


	mostMemberParticipateDatasource:any=[];
	mostMemberParticipateDatasourceLength:boolean=false;
	mostMemberParticipateDisplayedColumns = ['member_name', 'committee_number'];


	numberOfCommitteesAccordingToCommitteeDecisionResponsibleDatasource:any=[];
	numberOfCommitteesAccordingToCommitteeDecisionResponsibleDatasourceLength:boolean=false;
	numberOfCommitteesAccordingToCommitteeDecisionResponsibleDisplayedColumns = ['member_name', 'committee_number'];

	member="member"

	filterObject=new FilterObject();



	view: any[] = [600, 235];

	constructor(
	  private _crudService: CrudService,
	  private _translationService: TranslationService,
	  private _organizationService: OrganizationService,
	  private router: Router) { }
	ngAfterViewInit(): void {

	}

	ngOnInit() {
	  this.getLanguage();
	  this.getNumberOfTemporaryCommittiees();
	  this.getNumberOfPermanentCommittiees();
	  this.getNumberOfMembersOfStandingCommittiees();
	  this.getNumberOfFreezedCommitteeMembers();
	  this.getCommitteeDaysPassed();
	  this.getCommitteeRemainPercentageToFinish();
	  this.getMostMemberParticipate();
	  this.getNumberOfCommitteesAccordingToCommitteeDecisionResponsible();
	  this.getCommitteesStatuses();
	  this.getPercentageOfEvaluation();
	}

	getNumberOfTemporaryCommittiees()
	{
		this._crudService.getList(`admin/organizations/statistics/temporary-committees`).subscribe(
			(data) => {
				this.numOfTemporaryCommittiees=data;
			},
			(error) => {
			}
		);
	}

	getNumberOfPermanentCommittiees()
	{
		this._crudService.getList(`admin/organizations/statistics/permanent-committees`).subscribe(
			(data) => {
				this.numOfPermanentCommittiees=data;
			},
			(error) => {
			}
		);
	}

	getNumberOfMembersOfStandingCommittiees()
	{
		this._crudService.getList(`admin/organizations/statistics/standing-committee-members`).subscribe(
			(data) => {
				this.numOfMembersOfStandingCommittiees=data;
			},
			(error) => {
			}
		);
	}
	getNumberOfFreezedCommitteeMembers()
	{
		this._crudService.getList(`admin/organizations/statistics/freezed-committee-members`).subscribe(
			(data) => {
				this.numOfFreezedCommitteeMembers=data;
			},
			(error) => {
			}
		);
	}


	getCommitteeDaysPassed() {

		this._organizationService.getCommitteeDaysPassedPaginatedList<PagedResult>(this.filterObject).
		subscribe(res => {
			this.passedDaysDatasource = res.Results;
			if (this.passedDaysDatasource.length === 0) {
				this.passedDaysDatasourceLength = true;
			}
		},
			error => {
			});
	}


	getCommitteeRemainPercentageToFinish() {

		this._organizationService.getCommitteeRemainPercentageToFinishPaginatedList<PagedResult>(this.filterObject).
		subscribe(res => {
			this.committeeRemainPercentageToFinishDatasource = res.Results;
			if (this.committeeRemainPercentageToFinishDatasource.length === 0) {
				this.committeeRemainPercentageToFinishDatasourceLength = true;
			}
		},
			error => {
			});
	}

	getMostMemberParticipate() {

		this._organizationService.getMostMemberParticipatePaginatedList<PagedResult>(this.filterObject).
		subscribe(res => {
			this.mostMemberParticipateDatasource = res.Results;
			if (this.mostMemberParticipateDatasource.length === 0) {
				this.mostMemberParticipateDatasourceLength = true;
			}
		},
			error => {
			});
	}

	getNumberOfCommitteesAccordingToCommitteeDecisionResponsible() {

		this._organizationService.getNumberOfCommitteesAccordingToCommitteeDecisionResponsiblePaginatedList<PagedResult>(this.filterObject).
		subscribe(res => {
			this.numberOfCommitteesAccordingToCommitteeDecisionResponsibleDatasource = res.Results;
			if (this.numberOfCommitteesAccordingToCommitteeDecisionResponsibleDatasource.length === 0) {
				this.numberOfCommitteesAccordingToCommitteeDecisionResponsibleDatasourceLength = true;
			}
		},
			error => {
			});
	}



	getCommitteesStatuses()
	{
		this._crudService.getList(`admin/organizations/statistics/committees-statuses`).subscribe(
			(data) => {
				 this.committeesStatuses=data;
			},
			(error) => {
			}
		);
	}



	getPercentageOfEvaluation()
	{
		this._crudService.getList(`admin/organizations/statistics/percentage-of-evaluation`).subscribe(
			(data) => {
				 this.percentageOfEvaluation=data;
			},
			(error) => {
			}
		);
	}


	getLanguage() {
	  this.isArabic = this._translationService.isArabic();
	}



	redirectToDaysPassedStatistic() {
		this.router.navigate(["/dashboard/days-passed-statistics"]);
	}

	redirectToCommitteeRemainPercentage() {
		this.router.navigate(["/dashboard/committee-remain-percentage"]);
	}

	redirectToMostMemberParticipate() {
		this.router.navigate(["/dashboard/most-member-participate"]);
	}

	redirectToNumberOfCommitteesPerDecisionResponsible() {
		this.router.navigate(["/dashboard/number-of-committees-per-decision-responsible"]);
	}



}
