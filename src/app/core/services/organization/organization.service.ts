import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { FilterObject } from '../../models/filter-object';
import { BaseModel } from '../../models/baseModel';
import { Observable } from 'rxjs';


@Injectable()
export class OrganizationService {
    constructor(private _requestService: RequestService) { }

    updateOrganizationActiveState<T extends BaseModel>(addedObject: Object): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/organizations/activation', addedObject, null);
    }

    getOrganizationMeetingTypes<T extends BaseModel>(): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/organizations/meeting-types', null, null);
    }

    getOrganizationTimeZones<T extends BaseModel>(): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/organizations/time-zones', null, null);
    }

    getOrganizationMeetingRoles<T extends BaseModel>(): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/organizations/meeting-roles', null, null);
    }

    getOrganizationProposals<T extends BaseModel>(): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/organizations/organization-proposals', null, null);
    }

    getOrganizationGeneralStatistics() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organizations/statistics/general-statistics'
            , null, null);
    }

    getOrganizationGeneralStatisticsByOrganizationId(organizationId) {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organization/statistics/general-statistics/' + organizationId
            , null, null);
    }

    getOrganizationUserStatistics() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organizations/statistics/user-statistics'
            , null, null);
    }

    getOrganizationUserStatisticsByOrganizationId(organizationId) {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organization/statistics/user-statistics/' + organizationId
            , null, null);
    }

    getOrganizationMeetingStatistics() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organizations/statistics/meeting-statistics'
            , null, null);
    }

    getOrganizationMeetingStatisticsByOrganizationId(organizationId) {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organization/statistics/meeting-statistics/' + organizationId
            , null, null);
    }

    getOrganizationsPieChartStatistics() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organizations/organiztion-statistics/pie-chart'
            , null, null);
    }

    getOrganizationsBarChartStatistics() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organizations/organiztion-statistics/bar-chart'
            , null, null);
    }

    getHighActiveOrganizations() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL +
            'admin/organizations/organiztion-statistics/high-active-organizations'
            , null, null);
    }

    checkOrganizationCompletedData() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL +
            'admin/organizations/data-completed'
            , null, null);
    }

    downloadMicrosoftTeamsDocumentationPdf(lang: number) {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/microsoft-teams-documentation/' + lang, null, 'blob');
    }

    getOrganizationMomTemplates() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/mom-templates/list', null, null);
    }

    getOrganizationAgendaTemplates() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/agenda-templates/list', null, null);
    }

    getOrganizationMomSummaryTemplates() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/html-mom-templates/list', null, null);
    }

    downloadDisclosure() {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organizations/disclosure/download', null, 'blob');
    }

    downloadSystemDisclosure() {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/system-disclosure/download', null, 'blob');
	}


	getCommitteeDaysPassedPaginatedList <T extends BaseModel>(filterObject: FilterObject): Observable<T> {
		filterObject.PageSize=5;
        return this._requestService.SendRequest('POST', environment.apiBaseURL + "admin/organizations/statistics/committee-days-passed/filtered-list" , filterObject, null);
    }

	getCommitteeRemainPercentageToFinishPaginatedList <T extends BaseModel>(filterObject: FilterObject): Observable<T> {
		filterObject.PageSize=5;
        return this._requestService.SendRequest('POST', environment.apiBaseURL + "admin/organizations/statistics/committee-remain-percentage/filtered-list" , filterObject, null);
    }

	getMostMemberParticipatePaginatedList <T extends BaseModel>(filterObject: FilterObject): Observable<T> {
		filterObject.PageSize=5;
        return this._requestService.SendRequest('POST', environment.apiBaseURL + "admin/organizations/statistics/most-member-participate/filtered-list" , filterObject, null);
    }

	getNumberOfCommitteesAccordingToCommitteeDecisionResponsiblePaginatedList <T extends BaseModel>(filterObject: FilterObject): Observable<T> {
		filterObject.PageSize=5;
        return this._requestService.SendRequest('POST', environment.apiBaseURL + "admin/organizations/statistics/number-of-committees-per-decision-responsible/filtered-list" , filterObject, null);
    }

}
