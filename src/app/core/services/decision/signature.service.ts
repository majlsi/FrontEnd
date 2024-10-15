
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';


@Injectable()
export class SignatureService {
	constructor(private _requestService: RequestService) { }

	getDocumentPagesList(langCode: string, decisionId: number) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/signatures/document-pages/' + decisionId + '/' + langCode, null, null);
	}
	sign(documentFieldId: number, signObject: Object, decisionId: number) {
		return this._requestService.SendRequest('PUT', environment.apiBaseURL + 'admin/signatures/sign/' + decisionId + '/' + documentFieldId, signObject, null);
	}
	reject(documentFieldId: number, rejectObject: Object, decisionId: number) {
		return this._requestService.SendRequest('PUT', environment.apiBaseURL + 'admin/signatures/reject/' + decisionId + '/' + documentFieldId, rejectObject, null);
	}

	getUserSignatures(decisionId: number) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/signatures/user-signatures/' + decisionId, null, null);
	}
}

