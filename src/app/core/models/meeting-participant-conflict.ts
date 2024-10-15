
import { BaseModel } from './baseModel';

export class MeetingParticipantConflict extends BaseModel {
    id: number;
	meeting_title_en: string;
	meeting_title_ar: string;
	meeting_schedule_to: string;
	meeting_schedule_from: string;
	name: string;
    name_ar: string;
}
