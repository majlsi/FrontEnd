import { BaseModel } from './baseModel';

export class MeetingParticipantAlternative extends BaseModel {
    id: number;
    meeting_participant_id: number;
    rejection_reason_comment: string;
    meeting_title_ar: string;
    meeting_title_en: string;
    name_ar: string;
    name: string;
}
