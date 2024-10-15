import { Injectable } from '@angular/core';
import { RequestService } from '../shared/request.service';
import { environment } from '../../../../environments/environment';
import { FilterObject } from '../../models/filter-object';
import { BaseModel } from '../../models/baseModel';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable()
export class ChatService {

    newChatNotificationsIds: Array<number> = [];
    newChatNotificationsIdsUpdate: BehaviorSubject<Array<number>> = new BehaviorSubject([]);

    constructor(private _requestService: RequestService) { }

    getPaginatedList<T extends BaseModel>(ControllerName: string, filterObject: FilterObject): Observable<T> {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + ControllerName + '/filtered-list', filterObject, null);
    }

    sendCommiteeMesaage<T extends BaseModel>(committeeId: number, data: Object) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/chat-rooms/committees/' + committeeId + '/send', data, null);
    }

    sendMeetingMesaage<T extends BaseModel>(meetingId: number, data: Object) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/chat-rooms/meetings/' + meetingId + '/send', data, null);
    }

    getCommitteeChat<T extends BaseModel>(committeeId) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/committees/' + committeeId + '/chat-rooms', null, null);
    }

    getMeetingChat<T extends BaseModel>(meetingId) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' + meetingId + '/chat-rooms', null, null);
    }

    getAllChatRooms<T extends BaseModel>(filterObject: FilterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/chat-rooms/all', filterObject, null);
    }

    createMeetingChat<T extends BaseModel>(meetingId: number, filterObject: FilterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/meetings/' + meetingId + '/chat-rooms', filterObject, null);
    }

    createCommitteeChat<T extends BaseModel>(committeeId: number, filterObject: FilterObject) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/committees/' + committeeId + '/chat-rooms', filterObject, null);
    }

    getChat<T extends BaseModel>(chatGroupId) {
        return this._requestService.SendRequest('GET', environment.apiBaseURL + 'admin/chat-groups/' + chatGroupId, null, null);
    }

    createIndividualChat<T extends BaseModel>(data: Object) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/chat-groups/individual', data, null);
    }

    sendChatMesaage<T extends BaseModel>(chatGroupId: number, data: Object) {
        return this._requestService.SendRequest('POST', environment.apiBaseURL + 'admin/chat-groups/' + chatGroupId + '/send', data, null);
    }

    addNewChatNotificationsIdsArray(chatRoomId) {
        if (this.newChatNotificationsIds.indexOf(chatRoomId) === -1) {
            this.newChatNotificationsIds.push(chatRoomId);
            this.newChatNotificationsIdsUpdate.next(this.newChatNotificationsIds);
        }
    }

    removeReadChatNotificationsId(chatRoomId) {
        const markedIndex = this.newChatNotificationsIds.indexOf(chatRoomId);
        if (markedIndex !== -1) {
            this.newChatNotificationsIds.splice(markedIndex, 1);
            this.newChatNotificationsIdsUpdate.next(this.newChatNotificationsIds);
        }
    }

    getNewChatNotificationIds() {
        return this.newChatNotificationsIds;
    }
}
