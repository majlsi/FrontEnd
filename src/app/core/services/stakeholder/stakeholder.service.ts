import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { BaseModel } from '../../models/baseModel';
import { Observable } from 'rxjs';
import { UploadService } from '../shared/upload.service';

@Injectable()
export class StakeholderService {
    constructor(
        private _requestService: RequestService,
        private uploadService: UploadService) { }

    updateUserActiveState<T extends BaseModel>(addedObject: Object): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/stakeholders/activation', addedObject, null);
    }

    getTotalShares(): Observable<any> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'stakeholders/total-shares', null, null);
    }
    DownloadBlankExcelTemplate() {
        return this._requestService.DownloadFile(environment.apiBaseURL + 'stakeholders/download-blank-excel-template');
    }
    ValidStakeholdersFromExcel(file: File): Observable<any> {
        return this.uploadService.upload('stakeholders/valid-stakeholders-from-excel', file, null);
    }
    AddBulkStakeholdersFromExcel(list) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'stakeholders/add-bulk-stakeholders-from-excel', list, null);;
    }
}