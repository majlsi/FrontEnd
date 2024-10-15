import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { FilterObject } from '../../models/filter-object';
import { BaseModel } from '../../models/baseModel';
import { Observable } from 'rxjs';


@Injectable()
export class CommitteeService {
    constructor(private _requestService: RequestService) { }

    getOrganizationCommittees<T extends BaseModel>(): Observable<T[]> {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/committees/organization-committee/list', null, null);
    }

    getUserCommittees<T extends BaseModel>(): Observable<T[]> {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/users/committees', null, null);
    }

    getList<T extends BaseModel>(ControllerName: string, filterObject: FilterObject): Observable<T> {
        filterObject.PageSize = environment.pageSize;
        return this._requestService.SendRequest('POST', environment.apiBaseURL + ControllerName + '/list', filterObject, null);
    }


    unFreezeCommitteesRequest<T extends BaseModel>(data: any): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'request/unFreeze-committee', data, null);
    }

    getCommitteeUserRequests<T extends BaseModel>(committeeId:number): Observable<T[]> {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'requests/'+committeeId+'/users', null, null);
    }

    addCommitteeRecommendations<T extends BaseModel>(data: any, id: number): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/committees/' + id + '/recommendations', data, null);
    }

    unfreezeCommittee<T extends BaseModel>(data: any,id:number): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/committees/'+id+'/unfreeze', data, null);
    }

    getRemoveCommitteeCodeFeatureVariable() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'get-remove-committee-code-variable', null, null);
    }

    exportCommitteeData(committeeId:number) {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/committees/'+committeeId+'/export-excel', null, 'blob');
    }
    exportAllCommitteesData() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/committees/export-excel', null, 'blob');
    }
    exportMyCommitteesData() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/committees/export-my-committees-excel', null, 'blob');
    }
    addFinalOutputFileToCommittee<T extends BaseModel>(id: number, data: any): Observable<T> {
        return this._requestService.SendRequest('POST',
            environment.apiBaseURL + 'admin/committees/' + id + '/add-final-output-file',
            data, null);
    }

    downloadFinalOutput(id: number) {
        return this._requestService.SendRequest('get', environment.apiBaseURL + 'admin/committee-final-output/' + id + '/download-final-output', null, 'blob');
    }

    canRequestDeleteUser(id: number) {
        return this._requestService.SendRequest('get', environment.apiBaseURL + 'admin/committees/' + id + '/can-request-delete-member', null, null);
    }

    updateCommitteeRecommendationsStatus<T extends BaseModel>(meetingId: number, hasRecommendation: boolean): Observable<T> {
        return this._requestService.SendRequest('put', environment.apiBaseURL + 'admin/committees/' +
            meetingId + '/update-committee-recommendations-status', { has_recommendation_section: hasRecommendation }, null);
	}
    reminderCommitteeMembers(id: number) {
        return this._requestService.SendRequest('get', environment.apiBaseURL + 'admin/committees/' + id + '/reminder-committee-members', null, null);
    }

    addDisclosureToCommitteeUser(id: number, isConflict: boolean, file: File) {
        const formData: FormData = new FormData();
        formData.append('file', file, file.name);
        formData.append('is_conflict', JSON.stringify(isConflict));
        return this._requestService.SendRequest('POST',
            environment.apiBaseURL + 'admin/committee-users/' + id + '/add-disclosure-to-committee-user',
            formData, null
        );
    }

}
