import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { BaseModel } from '../../models/baseModel';
import { Observable, of } from 'rxjs';

@Injectable()
export class SettingService {
	constructor(
		private _requestService: RequestService) {
	}

    updateValues(data) {
        return this._requestService.SendRequest('PUT', environment.apiBaseURL + 'admin/settings',
        data, null);
	}

	getIntroductionVideoUrl() {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/settings/introduction-video', null, null);
	}

	getSupportEmail() {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/settings/support-email', null, null);
	}

	updateConfigrationValues(data: object,id: number) {
        return this._requestService.SendRequest('PUT', environment.apiBaseURL + 'admin/configrations/' + id,
        data, null);
	}

	getCongigrationColumn(column) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/configrations/columns/' + column, null, null);
	}
}
