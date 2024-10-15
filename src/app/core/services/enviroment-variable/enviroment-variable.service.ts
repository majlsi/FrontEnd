import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';


@Injectable()
export class EnvironmentVariableService {
  constructor(private _requestService: RequestService) { }

  getAddCommitteeFeatureVariable(): Observable<any> {
    return this._requestService.SendRequest('GET', environment.apiBaseURL + 'get-addCommitteeFeature-variable', null, null);
  }
  getAddUserFeatureVariable(): Observable<any> {
    return this._requestService.SendRequest('GET', environment.apiBaseURL + 'get-addUserFeature-variable', null, null);
  }
  getDeleteUserFeatureVariable(): Observable<any> {
    return this._requestService.SendRequest('GET', environment.apiBaseURL + 'get-deleteUserFeature-variable', null, null);
  }
  getWorkDoneFeatureVariable(): Observable<any> {
    return this._requestService.SendRequest('GET', environment.apiBaseURL + 'get-work-feature-variable', null, null);
  }

  getBlockUserFeatureVariable(): Observable<any> {
    return this._requestService.SendRequest('GET', environment.apiBaseURL + 'get-block-user-feature-variable', null, null);
  }
  getMeetingRecommendationsFeatureVariable(): Observable<any> {
    return this._requestService.SendRequest('GET', environment.apiBaseURL + 'get-meeting-recommendation-feature-variable', null, null);
  }
  getAdditionalUserFieldsVariable(): Observable<any> {
    return this._requestService.SendRequest('GET', environment.apiBaseURL + 'get-additional-user-fields-variable', null, null);
  }
  getLdapIntegrationFeatureVariable(): Observable<any> {
    return this._requestService.SendRequest('GET', environment.apiBaseURL + 'get-ldap-integration-feature-variable', null, null);
  }
  getCommitteeHasNatureFeatureVariable(): Observable<any> {
    return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/get-committee-nature-feature-variable', null, null);
  }
}
