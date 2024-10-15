import { BaseModel } from './baseModel';

export class MeetingStatus extends BaseModel {
    id: number;
    meeting_status_name_ar: string;
    meeting_status_name_en: string;
    color?: string;
}
