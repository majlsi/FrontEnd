import { BaseModel } from './baseModel';

export class AgendaPresenter extends BaseModel {
    id: number;
    user_id: number;
    meeting_agenda_id: number;
    meeting_guest_id?: number
}


