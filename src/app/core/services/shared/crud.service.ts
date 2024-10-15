import {Injectable} from '@angular/core';
import {RequestService} from './request.service';
import {environment} from '../../../../environments/environment';
import {FilterObject} from '../../models/filter-object';
import {BaseModel} from '../../models/baseModel';
import {Observable, switchMap} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';


@Injectable()
export class CrudService {
	constructor(private _requestService: RequestService,
				private _http: HttpClient) {
	}

	getList<T extends BaseModel>(ControllerName: string): Observable<T[]> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + ControllerName, null, null);
	}

	getPaginatedList<T extends BaseModel>(ControllerName: string, filterObject: FilterObject): Observable<T> {
		filterObject.PageSize = environment.pageSize;
		return this._requestService.SendRequest('POST', environment.apiBaseURL + ControllerName + '/filtered-list', filterObject, null);
	}

	get<T extends BaseModel>(ControllerName: string, id: number): Observable<T> {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + ControllerName + '/' + id, null, null);
	}

	add<T extends BaseModel>(ControllerName: string, addedObject: Object): Observable<T> {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + ControllerName, addedObject, null);
	}

	edit<T extends BaseModel>(ControllerName: string, editedObject: Object, id: number): Observable<T> {
		return this._requestService.SendRequest('PUT', environment.apiBaseURL + ControllerName + '/' + id, editedObject, null);
	}

	delete<T extends BaseModel>(ControllerName: string, id: number): Observable<T[]> {
		return this._requestService.SendRequest('DELETE', environment.apiBaseURL + ControllerName + '/' + id, null, null);
	}


	fetchByNationalId1<T extends BaseModel>(nationalId: string): Observable<T> {
		return this._requestService.SendRequest('GET', '/assets/jsons/by-national-id.json?' + nationalId, null, null);
	}


	integrationGetToken<T extends BaseModel>(): Observable<T> {
		const data = {
			userNationalId: '12345678',
			password: 'Pgd@1234'
		};
		const header = {
		};
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
		});
		return this._requestService.SendRequest2('http://10.10.110.30/proxy/api/Auth/Token', data, headers);
	}


	fetchByNationalId<T extends BaseModel>(nationalId: string): Observable<T> {
		const data = {
			nationalId
		};
console.log('data11111', data);
		return this.integrationGetToken().pipe(
			switchMap(
				(res: any) => {
					console.log('res', res);
					const headers = new HttpHeaders({
						'Content-Type': 'application/json',
						'Authorization': 'Bearer ' + res?.token,
					});
					return this._requestService.SendRequest2( 'http://10.10.110.30/proxy/api/EmployeeInfo/GetEmpInfo', data, headers);

				})
		);
	}
}
