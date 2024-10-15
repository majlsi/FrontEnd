import { BaseModel } from './baseModel';
import { Image } from './image';

export class MeetingOrganiser extends BaseModel {
    id: number;
    user_id: number;
    meeting_id: number;
}
