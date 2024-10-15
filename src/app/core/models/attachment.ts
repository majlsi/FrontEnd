import { BaseModel } from './baseModel';

export class Attachment extends BaseModel {
    id: number;
    meeting_id: number;
    attachment_url: string;
	attachment_name: string;
	mom_id: number;
    meeting_agenda_id: number;
    presenter_id: number;
    can_present: boolean;
    can_end: boolean;
    file_id: number;
}
