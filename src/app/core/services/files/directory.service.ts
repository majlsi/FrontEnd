import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';

@Injectable()
export class DirectoryService {

    constructor(private _requestService: RequestService) { }

    getMyDirectories(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'directories/my-directories'
            , filterObject, null);
    }

    getSharedDirectories(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'directories/shared'
            , filterObject, null);
    }


    getRecentDirectories(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'directories/recent'
            , filterObject, null);
    }

    downloadDirectory(directoryId) {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'directories/download/' + directoryId
            , null, 'arraybuffer');
    }
    getDirectoryDetails(directoryId) {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'directories/details/' + directoryId
            , null, null);
    }

    getDirectoryDetailsDirectories(directoryId, filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + `directories/details/${directoryId}/directories`, filterObject, null);
    }

    getDirectoryDetailsFiles(directoryId, filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + `directories/details/${directoryId}/files`, filterObject, null);
    }

    addDirectory(directory) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + `directories`, directory, null);
    }
    addChildDirectory(directoryId, directory) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + `directories/${directoryId}`, directory, null);
    }

    renameDirectory(directoryId, directory_name) {
        const data = {name: directory_name};
        return this._requestService.SendRequest('PUT', environment.apiBaseURL + `directories/rename/${directoryId}`, data, null);
    }

    delete(directoryId) {
        return this._requestService.SendRequest('DELETE', environment.apiBaseURL + `directories/${directoryId}`, null, null);
    }

    shareDirectory(directoryId, storageAccess) {
        return this._requestService.SendRequest('PUT', environment.apiBaseURL + `directories/shareFolder/${directoryId}`, storageAccess, null);
    }

    removeShare(directoryId, storageAccessID) {
        return this._requestService.SendRequest('PUT', environment.apiBaseURL + `directories/removeAccess/${directoryId}/${storageAccessID}`, null, null);
    }

}
