import { BaseModel } from './baseModel';

export class CommitteeUserRequest extends BaseModel {
    user_id: number;
    name: string;
    name_ar: string;
    email: string;
    committee_user_start_date: any;
    committee_user_expired_date: any;
}