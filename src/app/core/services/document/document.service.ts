import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';

@Injectable()
export class DocumentService {

    constructor(private _requestService: RequestService) { }

    downloadDocument(documentId: number) {
        return this._requestService.SendRequest('get', environment.apiBaseURL + 'admin/documents/'+ documentId + '/download', null, 'blob');
    }

    getDocumentSlides(documentId) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/documents/' + documentId + '/slides'
			, null, null);
    }
    
    changeStatusOfDocument(documentId) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/documents/' + documentId + '/complete'
			, null, null);
    }
}
