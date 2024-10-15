import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import { environment } from '../../../../environments/environment';
import { BaseModel } from '../../models/baseModel';
import {Observable} from 'rxjs';
import { json } from 'ngx-custom-validators/src/app/json/validator';
// import { FileItem } from 'ng2-file-upload';


@Injectable()
export class UploadService {
    constructor( private _requestService: RequestService) { }

    upload <T extends BaseModel>(ControllerName: string, file: File , path: string): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
		formData.append('path', path);
        return this._requestService.Upload( environment.apiBaseURL + ControllerName, formData, null);
	}


	uploadDocument<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
        return this._requestService.Upload( environment.apiBaseURL + 'upload-document', formData, null);
	}

	uploadDisclosure<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
        return this._requestService.Upload( environment.apiBaseURL + 'upload-disclosure', formData, null);
	}

	uploadAttachments <T extends BaseModel>(files: Array<File>): Observable<string> {
		const formData: FormData = new FormData();
		files.forEach(file => {
			formData.append('files[]', file, file.name);
		});
        return this._requestService.Upload( environment.apiBaseURL + 'upload-attachments', formData, null);
	}

	downloadFile(url: string) {
		return this._requestService.SendRequest('GET', url, null, 'blob');
	}

	uploadOrganizationLogo<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
        return this._requestService.Upload( environment.apiBaseURL + 'upload-organization-logo', formData, null);
	}

	uploadMomTemplateLogo<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
		return this._requestService.Upload( environment.apiBaseURL + 'upload-mom-template-logo', formData, null);
	}

	uploadUserImage<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
		return this._requestService.Upload( environment.apiBaseURL + 'upload-profile-image', formData, null);
	}

	uploadSystemPdf<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
		return this._requestService.Upload( environment.apiBaseURL + 'upload-system-pdf', formData, null);
	}

	uploadCircularDesisionAttachments<T extends BaseModel>(files: Array<File>): Observable<string> {
		const formData: FormData = new FormData();
		files.forEach(file => {
			formData.append('files[]', file, file.name);
		});
        return this._requestService.Upload( environment.apiBaseURL + 'upload-circular-decisions-attachment', formData, null);
	}

	uploadChatLogo<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
		return this._requestService.Upload( environment.apiBaseURL + 'upload-chat-logo', formData, null);
	}

	uploadMomPdf<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
        return this._requestService.Upload( environment.apiBaseURL + 'upload-mom-pdf', formData, null);
	}

	uploadApprovalDocument<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
        return this._requestService.Upload( environment.apiBaseURL + 'upload-approval-document', formData, null);
	}
	uploadEvidenceDocument<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
        return this._requestService.Upload( environment.apiBaseURL + 'upload-evidence-document', formData, null);
	}
	uploadBlockDocument<T extends BaseModel>(file: File): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
        return this._requestService.Upload( environment.apiBaseURL + 'upload-block-document', formData, null);
	}

	uploadCommitteeDocument<T extends BaseModel>(file: File, id: number): Observable<any> {
		const formData: FormData = new FormData();
		formData.append('file', file, file.name);
		formData.append('id', JSON.stringify(id));
		return this._requestService.Upload(environment.apiBaseURL + 'upload-committee-document', formData, null);
	}

}
