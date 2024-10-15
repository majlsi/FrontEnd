import { BaseModel } from "./baseModel"

export class AgendaParticipant extends BaseModel {
    meeting_guest_id?: number
    user_id?: number
    meeting_agenda_id?: number
}