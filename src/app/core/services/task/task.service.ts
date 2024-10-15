import {Injectable} from '@angular/core';
import {RequestService} from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { BaseModel } from '../../models/baseModel';
import {Observable} from 'rxjs';


@Injectable()
export class TaskService {
    constructor( private _requestService: RequestService) { }

    myTaskDashboard <T extends BaseModel>(data): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/task-management/my-dashboard', data, null);
    }

    startTask <T extends BaseModel>(data): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/task-management/start-task', data, null);
    }

    endTask <T extends BaseModel>(data): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/task-management/end-task', data, null);
    }

    renewTask<T extends BaseModel>(data): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/task-management/renew-task', data, null);
    }

    addCommentToTask<T extends BaseModel>(data): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'participant/task-management/comment', data, null);
    }

    organizationTaskDashboard<T extends BaseModel>(data): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/task-management/organization-dashboard', data, null);
    }

    downloadTasksPdf(lang: number) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/task-management/organization-dashboard/' + lang, null, 'blob');
	}

    organizationCommitteeDashboard<T extends BaseModel>(data, committeeId: number): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/committee-management/' + committeeId + '/organization-dashboard', data, null);
    }

    downloadCommitteeTasksPdf(committeeId: number, lang: number) {
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/task-management/committee-dashboard/' + committeeId + '/' + lang, null, 'blob');
    }
    
    downloadTasksStatistics(data: Object, lang: number) {
		return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/task-management/tasks-statistics/' + lang, data, 'blob');
    }

    getMeetingTasks(filterObject,meetingd){
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/'+meetingd+'/tasks', filterObject, null);
    }

    getDecisionTasks(filterObject,decisionId){
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/circular-decisions/'+decisionId+'/tasks', filterObject, null);

    }

    getTaskDetails(taskId){
		return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/task-management/'+taskId+'/details', null, null);
    }
}
