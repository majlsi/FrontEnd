import {Injectable} from '@angular/core';
import {RequestService} from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { FilterObject } from '../../models/filter-object';
import { BaseModel } from '../../models/baseModel';
// import {Observable} from 'rxjs';
import { Observable, of } from 'rxjs';
// import { of } from 'rxjs';


@Injectable()
export class MeetingsCalendarDataService {
    constructor( private _requestService: RequestService) { }


    getCalendarDataList(data: Object) {
         return this._requestService.SendRequest('POST', environment.apiBaseURL + 'users/meetings-per-month', data, null);
    }

    getCalendarDataListForOrganization(data: Object) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/organizations/meetings-per-month', data, null);
   }
}


