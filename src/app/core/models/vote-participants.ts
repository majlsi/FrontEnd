
import { BaseModel } from './baseModel';

export class VoteParticipants extends BaseModel {
    id: number;
    user_id: number;
    meeting_guest_id: number;
    vote_id: number;
    name: string;
}
