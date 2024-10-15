import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { BaseModel } from '../../models/baseModel';
import { Observable } from 'rxjs';


@Injectable()
export class CommitteeRequestService {
    constructor(private _requestService: RequestService) { }

    rejectRequest<T extends BaseModel>(data:any,id: number): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'requests/'+id+'/reject', data, null);
    }

    acceptAddCommitteeRequest<T extends BaseModel>(data:any,id: number): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'requests/'+id+'/create-committee', data, null);
    }

    addCommitteeMembersRequest<T extends BaseModel>(data:any): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'requests/add-committee-members', data, null);
    }

    acceptUpdateCommitteeRequest<T extends BaseModel>(id: number): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'requests/update-committee/' + id + '/accept', null, null);
    }
    exportAddCommitteesRequestsData() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'export-add-committees-requests', null,'blob');
    }
}
