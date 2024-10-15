
import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FileService {

    private loaderSubject = new BehaviorSubject<boolean>(null);
    private quotaSubject = new BehaviorSubject<any>(null);
    constructor(private _requestService: RequestService) { }
    getMyFiles(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'files/my-files'
            , filterObject, null);
    }

    getMyNewFiles(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'files/my-new-files'
            , filterObject, null);
    }

    getSharedFiles(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'files/shared'
            , filterObject, null);
    }


    getNewSharedFiles(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'files/new-shared'
            , filterObject, null);
    }
    getRecentFiles(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'files/recent'
            , filterObject, null);
    }

    downloadFile(fileId) {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'files/download/' + fileId,
            null, 'arraybuffer');
    }
    addFiles(files) {
        const formData: FormData = new FormData();
        files.forEach(file => {
            formData.append('files[]', file, file.name);
        });
        return this._requestService.Upload(environment.apiBaseURL + 'files/add-files', formData, null);
    }
    addFilesOnDirectory(files, directoryId) {
        const formData: FormData = new FormData();
        files.forEach(file => {
            formData.append('files[]', file, file.name);
        });
        return this._requestService.Upload(environment.apiBaseURL + 'files/add-files/' + directoryId, formData, null);
    }
    searchFiles(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'files/search'
        , filterObject, null);
    }
    searchGlobal(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'files/search-all'
        , filterObject, null);
    }

    renameFile(fileId, file_name) {
        const data = {name: file_name};
        return this._requestService.SendRequest('PUT', environment.apiBaseURL + `files/rename/${fileId}`, data, null);
    }

    delete(fileId) {
        return this._requestService.SendRequest('DELETE', environment.apiBaseURL + `files/${fileId}`, null, null);
    }

    shareFile(fileId, storageAccess) {
        return this._requestService.SendRequest('PUT', environment.apiBaseURL + `files/shareFile/${fileId}`, storageAccess, null);
    }

    removeShare(fileId, storageAccessID) {
        return this._requestService.SendRequest('PUT', environment.apiBaseURL + `files/removeAccess/${fileId}/${storageAccessID}`, null, null);
    }

    getStorageQuota() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'files/quota', null, null);
    }
    reloadStorageQuota() {
        this.getStorageQuota().subscribe(res => {
            this.quotaSubject.next(res);
        });
    }
    quotaObservable() {
        return this.quotaSubject.asObservable().pipe(filter(a => a != null ), catchError(err => null) );
    }
    showLoader() {
        this.loaderSubject.next(true);
    }
    hideLoader() {
        this.loaderSubject.next(false);
    }
    loaderObservable() {
        return this.loaderSubject.asObservable();
    }

    getDeleteFileFeatureVariable() {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'get-delete-file-variable', null, null);
    }

    deleteFileRequest(data) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'request/delete-file', data, null);
    }
}
