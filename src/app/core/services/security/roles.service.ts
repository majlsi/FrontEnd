import {Injectable} from '@angular/core';
import {RequestService} from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { BaseModel } from '../../models/baseModel';
import {Observable} from 'rxjs';

@Injectable()
export class RoleService {
    constructor(
        private _requestService: RequestService) {
    }

    getRoleSideMenu() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'userAccess/users/rights', null, null);
	}

	canAccess(rightid: number) {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'userAccess/roles/CanAccess/' + rightid, null, null);
	}

	moduleRights<T extends BaseModel> (ControllerName: string): Observable<T[]> {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'userAccess/roles/modules-rights' , null, null);
    }

    getAccessRights() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'userAccess/users/access-rights', null, null);
    }

    getAllRoleAccessRights() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'userAccess/users/all-access-rights', null, null);
    }

    getConversationRight() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'userAccess/users/conversation-right', null, null);
	}
}
