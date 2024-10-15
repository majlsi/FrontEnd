import {Injectable} from '@angular/core';
import {RequestService} from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { BaseModel } from '../../models/baseModel';
import {Observable} from 'rxjs';


@Injectable()
export class DashboardService {
    constructor( private _requestService: RequestService) { }

    getMemberDashboard<T extends BaseModel>(): Observable<T[]> {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'member-committee-dashboard', null, null);
    }

    getBoardDashboard<T extends BaseModel>(): Observable<T[]> {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'board-dashboard', null, null);
    }


    getCommitteeDashboard<T extends BaseModel>(committeeId): Observable<T[]> {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'committee-dashboard/'+committeeId, null, null);
    }

    getUserManagedCommittees() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'user-committees', null, null);
    }
}
