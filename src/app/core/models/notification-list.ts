import { BaseModel } from './baseModel';

export class NotificationList extends BaseModel {
    new_notifications: Array<any>;
    old_notifications: Array<any>;
}
