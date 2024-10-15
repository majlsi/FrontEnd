import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { FilterObject } from '../../models/filter-object';
import { BaseModel } from '../../models/baseModel';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable()
export class NotificationService {

    notificationData: BehaviorSubject<any> = new BehaviorSubject({});
    newNotificationCount: BehaviorSubject<number> = new BehaviorSubject(0);
    isNewNotification: BehaviorSubject<boolean> = new BehaviorSubject(true);

    constructor(private _requestService: RequestService) { }

    updateUnReadNotificationsToBeRead(id: number) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/notifications/' + id + '/read'  , null, null);
    }

    setNotificationDataChanged(notification) {
        this.notificationData.next(notification);
    }
    
    getNewNotificationCount(){
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/new-notifications/count'  , null, null);
    }

    setCountOfNewNotifications(newNotificationCount: number) {
        this.newNotificationCount.next(newNotificationCount);
    }

    getNotificationList(){
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/notifications/list'  , null, null);
    }

    getPaginatedList(filterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/notifications/filtered-list', filterObject, null);
    }

    setIsNewNotification(isNew){
        this.isNewNotification.next(isNew);
    }

    markAllNotificationsAsRead() {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/notifications/read-all', null, null);
    }
}
