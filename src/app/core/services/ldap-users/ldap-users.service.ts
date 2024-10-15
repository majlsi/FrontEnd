import {Injectable} from '@angular/core';
import {RequestService} from '../shared/request.service';
import { environment } from '../../../../environments/environment';


@Injectable()
export class LdapUsersService {
    constructor( private _requestService: RequestService) { }

   getLdapUser(userName: object){
    return this._requestService.SendRequest('Post', environment.apiBaseURL + 'users' + '/ldap-user' , userName, null);
   }
}