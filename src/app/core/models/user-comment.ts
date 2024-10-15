import { BaseModel } from './baseModel';

export class UserComment extends BaseModel {
    id: number;
    user_id: number;
    meeting_agenda_id: number;
	comment_text: string;
	created_at: any;
}
