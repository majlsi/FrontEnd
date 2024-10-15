import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { FilterObject } from '../../models/filter-object';
import { BaseModel } from '../../models/baseModel';
import { Observable } from 'rxjs';


@Injectable()
export class AddUserRequestService {
    constructor(private _requestService: RequestService) { }


    acceptRequest<T extends BaseModel>(data: any,id:number): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL +`requests/add-member-committee/${id}/accept`, data, null);
    }

	rejectRequest<T extends BaseModel>(data: any,id:number): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL +`requests/add-member-committee/${id}/reject`, data, null);
    }

	acceptDeleteMemberRequest<T extends BaseModel>(id:number): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL +`requests/delete-member-committee/${id}/accept`, null, null);
    }

	acceptDeleteFileRequest<T extends BaseModel>(id:number): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL +`requests/delete-file/${id}/accept`, null, null);
    }
    exportAddMemberToCommitteesRequestsData() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'export-add-member-to-committees-requests', null,'blob');
    }
    exportDeleteMemberFromCommitteesRequestsData() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'export-delete-member-from-committees-requests', null,'blob');
    }
    exportDeleteDocumentsRequestsData() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'export-delete-documents-requests', null,'blob');
    }
    exportUnfreezeMembersRequestsData() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'export-unfreeze-members-requests', null,'blob');
    }
}
