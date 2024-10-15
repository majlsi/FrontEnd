import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { BaseModel } from '../../models/baseModel';
import { Observable } from 'rxjs';

@Injectable()
export class UserService {
    constructor(
        private _requestService: RequestService) {
    }

    getCurrentUser() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'authenticate/user', null, null);
    }
    logOut() {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'authenticate/invalidate', null, null);
    }

    getOrganizationUsers() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organization-users', null, null);
    }

    getMatchedOrganizationUsers(data) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/organization-users', data, null);
    }

    getOrganizationUsersStakeholders(data) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/organization-users-stakeholders', data, null);
    }

    searchOrganizationUsersCommittees<T extends BaseModel>(data: Object): Observable<T[]> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/organization-users-committees', data, null);
    }

    updateUserActiveState<T extends BaseModel>(addedObject: Object): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/users/activation', addedObject, null);
    }

    updateMyProfile<T extends BaseModel>(addedObject: Object): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/users/my-profile', addedObject, null);
    }

    downloadDisclosure() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/users/disclosure/download', null, 'blob');
    }

    downloadOrganizationOrDefaultDisclosure() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/organizations/default-disclosure/download', null, 'blob');
    }

    checkIfCanAddUsers<T extends BaseModel>(addedObject: Object): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/added-users-check', addedObject, null);
    }

    getMeetingCommitteeUsers(data: any, meetingId: number) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' +
            meetingId + '/committee/users', data, null);
    }

    getCloudURL() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/current-url', null, null);
    }

    addMultiple(data: any) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/add-multiple-users', data, null);
    }

    AuthenticateGuest() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'guests/authenticate-guest', null, null);
    }

    UpdateGuest(data: any) {
        return this._requestService.SendRequest('PUT', environment.apiBaseURL + 'guests/update-guest', data, null);
    }

    GetGuestInfo() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'guests/get-guest', null, null);
    }
    updateUserBlockState<T extends BaseModel>(addedObject: Object): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/users/block', addedObject, null);
    }
    exportUnActiveUsers()
    {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/users/export-unActive-users-excel', null,'blob');
    }
}
