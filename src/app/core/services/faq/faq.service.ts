import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';

@Injectable()
export class FaqService {

	constructor(
		private _requestService: RequestService) {
	}

	getFaqParentSections() {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/faq-sections/parents/list', null, null);
	}
	getLeafSections(){
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/faq-sections/leafs/list', null, null);
	}

	getFaqTree(){
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/faqs/section/tree', null, null);

	}
}
