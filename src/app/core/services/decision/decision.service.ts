import {Injectable} from '@angular/core';
import {RequestService} from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { FilterObject } from '../../models/filter-object';
import { BaseModel } from '../../models/baseModel';
import {Observable} from 'rxjs';


@Injectable()
export class DecisionService {
    constructor( private _requestService: RequestService) { }

    changeCircularDecisionResultToAbstained<T extends BaseModel>(voteId: number): Observable<T[]> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/circular-decisions/' + voteId + '/abstained', null, null);
    }

    changeCircularDecisionResultToNo<T extends BaseModel>(voteId: number): Observable<T[]> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/circular-decisions/' + voteId + '/no', null, null);
    }

    changeCircularDecisionResultToYes<T extends BaseModel>(voteId: number): Observable<T[]> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/circular-decisions/' + voteId + '/yes', null, null);
    }

	loginUserToVoteSignature<T extends BaseModel>(voteId: number): Observable<any> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/circular-decisions/' +
		voteId + '/signature-login', { vote_id: voteId }, null);
    }

    downloadDecisionPdf(decisionId: number,langId: number) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/circular-decisions/' +
			decisionId + '/pdf-download/' + langId, null, 'blob');
	}
}
